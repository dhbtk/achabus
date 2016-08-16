require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Achabus
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
    config.generators do |g|
      g.assets false
      g.stylesheets false
      g.javascripts false
      g.helper false
      g.test_framework nil
    end

    config.active_record.schema_format = :sql
    config.active_record.time_zone_aware_types = [:datetime, :time]
  end
end
