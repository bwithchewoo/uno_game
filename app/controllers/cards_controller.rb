class CardsController < ApplicationController
  skip_before_action :authorize
  def handle_create_card
    game = Game.find_by_id(params[:game_id])
    if game == nil
      render plain: "Game not found"
    end
    card_array = create_card_array(game.id)
    card_array.each do |card|
      new_card = Card.new(card)
      new_card.save
      #puts new_card.errors.full_messages
    end
  end

  def handle_get_deck
    game_id = params[:game_id]
    deck = get_deck(game_id)

    render json: deck
  end

  def handle_generate_hand
    game_id = params[:game_id]
    player_id = params[:player_id]
    hand = generate_hand(game_id, player_id)
  end

  def get_hand
    player = params[:player_id]
    hand = Card.where(player_id: player)
    render json: hand
  end

  def handle_first_card
    game_id = params[:game_id]
    first_card = setFirstCardInPlay(game_id)
    puts first_card.attributes
  end

end

def setFirstCardInPlay(game_id)
  deck = get_deck(game_id)
  random_card = deck.find { |card| card.is_available? && card.color != "black" }

  if random_card
    random_card.update(is_available: false, in_play: true)
    return random_card
  end


end

def get_deck(game_id)
  deck = Card.where(game_id: game_id)

  return deck
end

def create_card_array(game_id)
  cardArray = []
  colors = ["red", "blue", "yellow", "green"]
  for color in colors do
    cardArray.push({
      "game_id" => game_id,
      "color" => color,
      "player_id" => nil,
      "in_play" => false,
      "is_available" => true,
      "value" => 0

    })
    cardArray.push({
      "game_id" => game_id,
      "color" => "black",
      "player_id" => nil,
      "in_play" => false,
      "is_available" => true,
      "value" => "wild"
    })
    cardArray.push({
      "game_id" => game_id,
      "color" => "black",
      "player_id" => nil,
      "in_play" => false,
      "is_available" => true,
      "value" => "wild draw 4"
    })
    for i in 1..2 do
      cardArray.push({
        "game_id" => game_id,
        "color" => color,
        "player_id" => nil,
        "in_play" => false,
        "is_available" => true,
        "value" => "+2"
      })
      cardArray.push({
        "game_id" => game_id,
        "color" => color,
        "player_id" => nil,
        "in_play" => false,
        "is_available" => true,
        "value" => "reverse"
      })
      cardArray.push({
        "game_id" => game_id,
        "color" => color,
        "player_id" => nil,
        "in_play" => false,
        "is_available" => true,
        "value" => "skip"
      })

      for i in 1..9 do
        cardArray.push({
          "game_id" => game_id,
          "color" => color,
          "player_id" => nil,
          "in_play" => false,
          "is_available" => true,
          "value" => i
        })
      end
    end
  end
  return cardArray
end




def generate_hand(game_id, player_id)
  hand = []
  deck = get_deck(game_id)
  while hand.length < 7
    #cardArray does not exist, in separate function, must call get_deck and then do random
    random_card = deck.sample
    if random_card.is_available == true
      hand.push(random_card.id)
      random_card.update(is_available: false)
    end
  end
  Card.where(id: hand).update_all(player_id: player_id, is_available: false)
end










