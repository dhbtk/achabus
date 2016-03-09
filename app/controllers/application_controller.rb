class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  before_action do
    unless authenticate_with_http_basic { |u,p| u == "achabus-dev" && p == ENV['TEMP_PASSWORD'] }
      request_http_basic_authentication
    end
  end
end
