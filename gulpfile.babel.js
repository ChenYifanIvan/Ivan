require('dotenv').config()
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import path from 'path';
import runSequence from 'run-sequence';
import rename from 'gulp-rename';
import eslint from 'gulp-eslint';
import webpack from 'webpack';
import del from 'del';
import awspublish from 'gulp-awspublish';
import parallelize from 'concurrent-transform';

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe(eslint({ fix: false }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint-fix', () => {
  return gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(gulpIf(file => file.eslint != null && file.eslint.fixed, gulp.dest('src/')))
    .pipe(eslint.failAfterError());
});

gulp.task('publish', () => {
  const publisher = awspublish.create({
    region: process.env.AWS_S3_REGION,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const headers = {};

  return gulp.src('./build/**/*')
    .pipe(rename((p => {
      p.dirname = path.join(process.env.AWS_S3_PATH, p.dirname);
    })))
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(headers, {
      force: true,
    }), 8))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});

gulp.task('compile', (cb) => {
  return webpack(require('./webpack.config.js'), cb);
});

gulp.task('clean', () => {
  return del(['build']);
});

gulp.task('deploy', () => {
  return runSequence('clean', 'compile', 'publish');
});

