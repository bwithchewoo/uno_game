Rails.application.routes.draw do
  get "/games", to: "games#index"
  get "/users", to: "users#index"
  get "/getdeck", to: "cards#handle_get_deck"
  get "/players", to: "games#get_players"
  get "/getgame", to: "games#get_game"
  post "/creategame", to: "games#create"
  post "/startgame", to: "games#start_game"
  delete "/deletegame", to: "games#destroy"
  get "/gethand", to: "cards#get_hand"
  post "/signup", to: "users#create"
  post "/login", to: "sessions#create"
  delete "/logout", to: "sessions#destroy"
  get "/me", to: "users#show"
  patch "/updatepicture", to: "users#update_picture"
  # Routing logic: fallback requests for React Router.
  # Leave this here to help deploy your app later!
  get "*path", to: "fallback#index", constraints: ->(req) { !req.xhr? && req.format.html? }
end
