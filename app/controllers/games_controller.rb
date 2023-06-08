class GamesController < ApplicationController
  skip_before_action :authorize

  #WORK ON THIS LOGIC


  def destroy
    game = Game.find_by(id: params[:game_id])
    if game
      game.cards.destroy_all
      game.players.destroy_all
      game.destroy
    end
  end

  def get_hand

    hand = Card.where(game_id: params[:game_id], player_id: params[:player_id])
    render json: hand
  end

  def get_players
  game = Game.find_by_id(params[:game_id])
  players = game.players
  render json: players
  end

  def get_game
    game = Game.find_by_id(params[:game_id])
    render json: game
  end

  def create
    game = Game.create!(game_state: "created", direction: "clockwise")
    game_id = game.id
    singleplayer = params[:singleplayer]

    add_user_as_player(game_id)
    if singleplayer
      fillBots(game_id)
    end
    set_player_order(game_id)
    render json: game, status: :created
  end

def draw_cards
#draw until player has playable card

  game_id = params[:game_id].to_i
  current_player_id = params[:player_id].to_i
  last_card = get_last_card_played(game_id)
  hand = Card.where(game_id: game_id, player_id: current_player_id)
  playable_results = []
  hand.each do |card|
    playable = is_card_playable(game_id, card.id)
    playable_results << playable
  end

  has_playable_card = playable_results.include?(true)
  deck = get_deck(game_id)
  if !has_playable_card && (last_card.value == "+2" || last_card.value == "wild draw 4")
    game = Game.find_by_id(game_id)
    counter = game.draw_cards_counter
    new_cards = deck.select { |card| card.is_available}.sample(counter)
    new_card_ids = new_cards.pluck(:id)
    Card.where(id: new_card_ids).update_all(player_id: current_player_id, is_available: false)
    game.update(draw_cards_counter: 0)
  elsif !has_playable_card

    random_card = deck.sample
    if random_card.is_available == true
      random_card.update(is_available: false)
    end
    Card.where(id: random_card.id).update_all(player_id: current_player_id, is_available: false)
  else
    puts "has playable card"
  end
end


  def play_card
    #current_player_id will eventually need to change back to sessions[:user_id], but doesnt work now for testing
    current_player_id = params[:player_id].to_i
    game_id = params[:game_id].to_i
    game = Game.find_by_id(game_id)
    card_id = params[:card_id].to_i
    color = params[:color]
    card = Card.find_by_id(card_id)

    if !check_turn(game_id, current_player_id)
      puts 'not ur turn'
      #check if card is playable, other return error cannot play card
      #move card from user hand to discard -> change in_play: true, player_id: nil
      #card_id value
      return
    end

    if !is_card_playable(game_id, card_id)
      puts'not playable'
      return
    end

    puts "card is played, #{card.color} #{card.value}"
    card.update(in_play: true, player_id: nil)
    play_card_effect(card_id, color, game_id, current_player_id)
    hand_length = Card.where(game_id: game_id, player_id: current_player_id).length
    if hand_length > 0
      set_next_turn(game_id, current_player_id)
      return
    else
      game.update(game_state: "ended")
      return
    end
  end





  def start_game
    game = Game.find_by_id(params[:game_id])
    game_id = params[:game_id]
    players = Player.where(game_id: game_id)
    if game.player_count == 4
    game.update(game_state: "started")
    card_array = create_card_array(game.id)

    card_array.each do |card|
      new_card = Card.new(card)
      puts new_card
      new_card.save
    end
    players.each do |player|
      hand = generate_hand(game_id, player.id)
    end
    first_card = setFirstCardInPlay(game_id)
  else
    return "Not enough players to start the game."
    end
  end



  def index
    puts "Hello"
    puts ENV
  end

end # End of GamesController

def check_turn(game_id, player_id)
  # Returns true if its player_id's turn in game.
  current_game = Game.find(game_id)
  current_player_id = current_game.current_player_id
  puts "checking player turn, current player id is #{current_player_id}, player trying to play is #{player_id}"
  puts current_player_id.inspect
  puts player_id.inspect
  if current_player_id == player_id
    puts 'returning true yolo'
    return true
  else
    return false
  end
end

def is_card_playable(game_id, card_id)
  # Returns true if the card is playable , false otherwise
  game = Game.find_by_id(game_id)
  card_to_play = Card.find_by_id(card_id)
  # (TODO) Is card to play in the current player's hand and is playable
  #check value of card_id against value of last_Card_played
  last_card_played = get_last_card_played(game_id)
  if card_to_play.value == last_card_played.value
    return true
  elsif game.draw_cards_counter == 0 && (last_card_played.value == "+2" || last_card_played.value == "wild draw 4") && card_to_play.color == last_card_played.color
    return true
  elsif last_card_played.value == "+2" && card_to_play.value != "+2"
    return false
  elsif last_card_played.value == "wild draw 4" && card_to_play.value != "wild draw 4"
    return false
  elsif card_to_play.color == last_card_played.color
    return true
  elsif card_to_play.color == "black"
    return true
  else
    return false
  end
end

def get_last_card_played(game_id)
  most_recent_card = Card.where(in_play: true, game_id: game_id).order(updated_at: :desc).first
end

def set_player_order(game_id)
  players = Player.where(game_id: game_id)
  player_ids = players.pluck(:id)
  shuffled_player_order = player_ids.shuffle
  game = Game.find(game_id)
  game.update(player_order: shuffled_player_order)
  game.update(current_player_id: shuffled_player_order[0])
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
  puts deck.length
  return deck
end

def generate_hand(game_id, player_id)
  hand = []
  deck = get_deck(game_id)
  while hand.length < 7
    #cardArray does not exist, in separate function, must call get_deck and then do random
    random_card = deck.sample
    puts random_card
    if random_card.is_available == true
      hand.push(random_card.id)
      random_card.update(is_available: false)
    end
  end
  Card.where(id: hand).update_all(player_id: player_id, is_available: false)
end




def add_user_as_player(game_id)
  current_user = session[:user_id]
  game = Game.find_by(id: game_id)
  player_count = game.player_count

  unless Player.exists?(game_id: game_id)
    is_host = true
  else
    is_host = false
  end

  player = Player.create!(user_id: current_user, game_id: game_id, is_host: is_host, is_bot: false)
  new_player_count = game.player_count.to_i + 1
  game.update(player_count: new_player_count)
end

def fillBots(game_id)
  game = Game.find_by(id: game_id)
  player_count = game.player_count

  while player_count < 4
    player = Player.create!(game_id: game_id, is_bot: "true", is_host: "false")
    player_count += 1
  end
  game.update(player_count: player_count)
end

def set_next_turn(game_id, current_player_id)
  current_game = Game.find_by_id(game_id)
  if current_game.direction == "clockwise"
    current_player_position = current_game.player_order.index(current_player_id)
    next_index = (current_player_position + 1) % current_game.player_order.length
    next_player = current_game.player_order[next_index]
    current_game.update(current_player_id: next_player)
  elsif current_game.direction == "counter-clockwise"
    current_player_position = current_game.player_order.index(current_player_id)
    previous_index = (current_player_position - 1) % current_game.player_order.length
    previous_player = current_game.player_order[previous_index]
    current_game.update(current_player_id: previous_player)
  end
end

def play_card_effect(card_id, color, game_id, current_player_id)
  card_to_play = Card.find_by_id(card_id)
  current_game = Game.find_by_id(game_id)
  if card_to_play.value == "wild"
    card_to_play.update(color: color)
  elsif card_to_play.value == "wild draw 4"
    card_to_play.update(color: color)
    counter_add_four = current_game.draw_cards_counter.to_i + 4
    current_game.update(draw_cards_counter: counter_add_four)
  elsif card_to_play.value == "reverse"
    current_game.update(direction: "counter-clockwise")
  elsif card_to_play.value == "+2"
    counter_add_two = current_game.draw_cards_counter.to_i + 2
    current_game.update(draw_cards_counter: counter_add_two)
  elsif card_to_play.value == "skip"
    if current_game.direction == "clockwise"
      current_player_position = current_game.player_order.index(current_player_id)
      next_index = (current_player_position + 1) % current_game.player_order.length
      next_player = current_game.player_order[next_index]
      current_game.update(current_player_id: next_player)
    elsif current_game.direction == "counter-clockwise"
      current_player_position = current_game.player_order.index(current_player_id)
      previous_index = (current_player_position - 1) % current_game.player_order.length
      previous_player = current_game.player_order[previous_index]
      current_game.update(current_player_id: previous_player)
    end
  end
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
