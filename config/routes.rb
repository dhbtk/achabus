Rails.application.routes.draw do

  resources :route_points do
    member do
      get 'to'
    end
    collection do
      get 'closest_to'
    end
  end
  resources :points do
    member do
      post 'forward'
      post 'backward'
      post 'left'
      post 'right'
    end
  end
  get 'trace_route', to: 'route_tracer#trace'
  get 'walking_path', to: 'route_tracer#walking_path'


  resources :lines do
    resources :timetables, shallow: true
    resources :routes, shallow: true
  end
  resources :line_groups

  get 'admin', to: 'router#admin'
  root to: 'router#frontend'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
