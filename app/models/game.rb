class Game < ApplicationRecord
has_many :cards, dependent: :destroy
has_many :players, dependent: :destroy
end
