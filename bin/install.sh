#!/bin/bash

mkdir -p public;
mkdir -p public/css;
mkdir -p public/js;
mkdir -p public/view;
mkdir -p public/fonts;

cp -p ./bower_components/bootstrap/dist/css/bootstrap.css ./public/css/;
cp -p ./bower_components/bootstrap/dist/js/bootstrap.js ./public/js/;
cp -p ./bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.* ./public/fonts/;
cp -p ./bower_components/jquery/dist/jquery.js ./public/js/;
cp -p ./bower_components/angular/angular.js ./public/js/;
cp -p ./bower_components/angular-resource/angular-resource.js ./public/js/;
cp -p ./bower_components/angular-route/angular-route.js ./public/js/;

cp -p ./client/index.html ./public/;
cp -p ./client/view/* ./public/view;
cp -p ./client/css/* ./public/css;
cp -p ./client/js/* ./public/js/;



