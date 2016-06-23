class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  before_action :auth_basic_temp

  def auth_basic_temp
    unless request.remote_ip == '127.0.0.1' || request.remote_ip == '::1' || authenticate_with_http_basic { |u, p| u == "achabus-dev" && p == ENV['TEMP_PASSWORD'] }
      request_http_basic_authentication
    end
  end

  def default_url_options
    {protocol: 'https', host: 'abadm.edanni.io'}
  end
end
