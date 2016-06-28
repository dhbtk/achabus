# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160628155253) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"
  enable_extension "address_standardizer"

  create_table "line_groups", id: :integer, force: :cascade do |t|
    t.string   "name"
    t.string   "city"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "lines", id: :integer, force: :cascade do |t|
    t.string   "short_name"
    t.string   "name"
    t.integer  "line_group_id"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.string   "timetable_link"
    t.string   "itinerary_link"
    t.index ["line_group_id"], name: "index_lines_on_line_group_id", using: :btree
  end

  create_table "place_points", id: :integer, force: :cascade do |t|
    t.integer  "place_id"
    t.integer  "point_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_place_points_on_place_id", using: :btree
    t.index ["point_id"], name: "index_place_points_on_point_id", using: :btree
  end

  create_table "places", id: :integer, force: :cascade do |t|
    t.geometry "position",   limit: {:srid=>0, :type=>"point"}
    t.string   "name"
    t.datetime "created_at",                                    null: false
    t.datetime "updated_at",                                    null: false
  end

  create_table "points", id: :integer, force: :cascade do |t|
    t.geography "position",     limit: {:srid=>4326, :type=>"point", :geographic=>true}
    t.string    "name"
    t.string    "notable_name"
    t.boolean   "notable"
    t.datetime  "created_at",                                                                                                     null: false
    t.datetime  "updated_at",                                                                                                     null: false
    t.boolean   "waypoint",                                                                                       default: false
    t.decimal   "heading",                                                               precision: 16, scale: 5
  end

  create_table "route_points", id: :integer, force: :cascade do |t|
    t.integer  "route_id"
    t.integer  "point_id"
    t.integer  "order"
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.boolean  "pass_through",   default: false
    t.integer  "polyline_index"
    t.index ["point_id"], name: "index_route_points_on_point_id", using: :btree
    t.index ["route_id"], name: "index_route_points_on_route_id", using: :btree
  end

  create_table "routes", id: :integer, force: :cascade do |t|
    t.integer  "parent_route_id"
    t.string   "name"
    t.string   "short_name"
    t.geometry "route_path_markers", limit: {:srid=>0, :type=>"line_string"}
    t.geometry "route",              limit: {:srid=>4326, :type=>"line_string"}
    t.datetime "created_at",                                                     null: false
    t.datetime "updated_at",                                                     null: false
    t.integer  "line_id"
    t.string   "origin"
    t.string   "destination"
    t.index ["line_id"], name: "index_routes_on_line_id", using: :btree
  end

  create_table "timetables", id: :integer, force: :cascade do |t|
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.boolean  "sunday"
    t.boolean  "monday"
    t.boolean  "tuesday"
    t.boolean  "wednesday"
    t.boolean  "thursday"
    t.boolean  "friday"
    t.boolean  "saturday"
    t.integer  "start_place_id"
    t.integer  "end_place_id"
    t.integer  "line_id"
    t.index ["line_id"], name: "index_timetables_on_line_id", using: :btree
  end

  add_foreign_key "lines", "line_groups"
  add_foreign_key "place_points", "places"
  add_foreign_key "place_points", "points"
  add_foreign_key "route_points", "points"
  add_foreign_key "route_points", "routes"
  add_foreign_key "routes", "lines"
  add_foreign_key "routes", "routes", column: "parent_route_id"
  add_foreign_key "timetables", "lines"
  add_foreign_key "timetables", "places", column: "end_place_id"
  add_foreign_key "timetables", "places", column: "start_place_id"
end
