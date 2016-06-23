require 'test_helper'

class RouteTracerControllerTest < ActionDispatch::IntegrationTest
  test "should get trace" do
    get route_tracer_trace_url
    assert_response :success
  end

end
