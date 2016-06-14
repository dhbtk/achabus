require 'test_helper'

class RoutePointsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @route_point = route_points(:one)
  end

  test "should get index" do
    get route_points_url
    assert_response :success
  end

  test "should get new" do
    get new_route_point_url
    assert_response :success
  end

  test "should create route_point" do
    assert_difference('RoutePoint.count') do
      post route_points_url, params: {route_point: {order: @route_point.order, point_id: @route_point.point_id, polyline_index: @route_point.polyline_index, route_id: @route_point.route_id}}
    end

    assert_redirected_to route_point_path(RoutePoint.last)
  end

  test "should show route_point" do
    get route_point_url(@route_point)
    assert_response :success
  end

  test "should get edit" do
    get edit_route_point_url(@route_point)
    assert_response :success
  end

  test "should update route_point" do
    patch route_point_url(@route_point), params: {route_point: {order: @route_point.order, point_id: @route_point.point_id, polyline_index: @route_point.polyline_index, route_id: @route_point.route_id}}
    assert_redirected_to route_point_path(@route_point)
  end

  test "should destroy route_point" do
    assert_difference('RoutePoint.count', -1) do
      delete route_point_url(@route_point)
    end

    assert_redirected_to route_points_path
  end
end
