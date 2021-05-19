"use strict";
//init gulp module
var gulp = require('gulp'),
  // init $ autoload from package.json
  $ = require('gulp-load-plugins')({
    overridePattern: true,
    pattern: ['gulp-*', 'gulp.*', '@*/gulp{-,.}*', 'browser-sync', 'imagemin-*'],
  }),
  autoprefixer = require('autoprefixer'),
  combineMq = require('css-mqpacker'),
  // init reload function
  reload = $.browserSync.reload,
  //setup project paths
  path = {
    // build paths
    build: {
      css: './assets/css/',
      img: './assets/images/',
    },
    // source paths
    source: {
      style: [
        'assets/scss/generic/generic.scss',
        'assets/scss/elements/elements.scss',
        'assets/scss/objects/objects.scss',
        'assets/scss/components/components.scss',
        'assets/scss/utilities/utilities.scss',
      ],
      img: './assets/sourceimages/**/*.*',
    },
    //which files are watching
    watch: {
      twig: './**/*.twig',
      style: './assets/scss/**/*.scss',
      img: './assets/sourceimages/**/*.*',
      fonts: './assets/fonts/**/*.*'
    },
  },
  // server setups
  config = {
    proxy: 'http://akdev.lan',
    host: 'akdev.lan',
    open: 'external',
  };

gulp.task('style:build', function () {
  var plugins =[
    autoprefixer({
      grd:true,
    }),
    combineMq({
      sort: true
    }),
  ]
  return gulp.src(path.source.style)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({outputStyle: 'compressed'})) //nested, expanded, compact, compressed
    .on("error", $.sass.logError)
    .pipe($.postcss(plugins))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
  return gulp.src(path.source.img)
    .pipe($.plumber())
    .pipe($.newer(path.build.img))
    .pipe($.image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      mozjpeg: true,
      guetzli: false,
      gifsicle: true,
      svgo: true,
      concurrent: 10,
      quiet: true // defaults to false
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}))
});

gulp.task('build', gulp.parallel([
  'style:build',
  'image:build'
]));

gulp.task('run', function () {
  $.browserSync(config);
  gulp.watch([path.watch.twig, path.watch.fonts], gulp.parallel(reload));
  gulp.watch(path.watch.style, gulp.parallel('style:build'));
  gulp.watch(path.watch.img, gulp.parallel('image:build'));
});

gulp.task('default', gulp.series('build', gulp.parallel('run')));
