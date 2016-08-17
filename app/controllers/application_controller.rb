class ApplicationController < ActionController::Base
  before_action :authenticate_admin!

  def default_url_options
    {protocol: 'https', host: 'abadm.edanni.io'}
  end
end
