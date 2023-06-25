class Game < ApplicationRecord
has_many :cards, dependent: :destroy
has_many :players, dependent: :destroy
# after_create_commit {broadcast_game}
# private
# def broadcast_game
#   ActionCable.server.broadcast("GameChannel", {

#   })
#   end
end
