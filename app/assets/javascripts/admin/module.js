/**
 * Created by eduardo on 27/06/16.
 */
let angular = require('angular');
require('angular-breadcrumb');
module.exports = angular.module('admin', [require('angular-material'), require('angular-material-sidemenu'), require('angular-ui-router'),'ncy-angular-breadcrumb']);
