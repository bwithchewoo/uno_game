class Player < ApplicationRecord
belongs_to :user, optional: true
belongs_to :game
has_many :cards, dependent: :destroy
end
