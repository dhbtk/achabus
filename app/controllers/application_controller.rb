class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  before_action :authenticate_admin!

  def default_url_options
    {protocol: 'https', host: 'abadm.edanni.io'}
  end
end
