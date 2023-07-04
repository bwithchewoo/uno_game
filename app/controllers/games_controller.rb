class GamesController < ApplicationController
  skip_before_action :authorize

  #WORK ON THIS LOGIC


  def destroy
    game_id = params[:id]
    game = Game.find_by(id: params[:id])
    puts "This is the params in destroy #{params}"
    puts "This is the game thats being deleted #{game}"
    if game
      game.cards.destroy_all
      game.players.destroy_all
      game.destroy
    end
    message = {
      updated_game: nil.as_json
    }
    GameChannel.broadcast_to(game_id, message)
  end

  def get_hand

    hand = Card.where(game_id: params[:game_id], player_id: params[:player_id])
    render json: hand
  end

  def add_bot
    game = Game.find(params[:game_id])
    game_id = game.id
    player_count = game.player_count
    player = Player.create!(game_id: game_id, is_bot: "true", is_host: "false")
    player_count += 1
    game.update(player_count: player_count)
    game = Game.find(params[:game_id])
    message = {
      updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
    }
    GameChannel.broadcast_to(game_id, message)
    render json: game, include: {cards: {}, players: { include: :cards } }
  end

def get_users_profile_pictures
  game = Game.find(params[:game_id])
  players = game.players
  player_data = players.map do |player|
    if player.user_id
      user = User.find(player.user_id)
      {
        id: player.id,
        user_id: player.user_id,
        username: user.username,
        profile_picture: user.profile_picture,
        is_bot: false
      }
    else
      {
        id: player.id,
        is_bot: true
      }
    end
  end
  render json: {players: player_data}
end

  def get_existing_game
    current_user_id = session[:user_id]
    game = Game.joins(:players).where(game_state: ["started", "created"], players: { user_id: current_user_id }).last
    render json: game, include: {cards: {}, players: { include: :cards } }
  end

  def get_players
  game = Game.find_by_id(params[:game_id])
  players = game.players
  render json: players
  end

  def get_game
    game = Game.find_by_id(params[:game_id])
    render json: game, include: {cards: {}, players: { include: :cards } }
  end

  def create
    game = Game.create!(game_state: "created", direction: "clockwise")
    game_id = game.id
    singleplayer = params[:singleplayer]

    add_user_as_player(game_id)
    if singleplayer
      fillBots(game_id)
    end
    #set_player_order(game_id, singleplayer)
    game = Game.find_by_id(game_id)
    render json: game, include: {cards: {}, players: { include: :cards } }, status: :created
  end

  def join_game
    game = Game.where(game_state: "created").where("player_count < ?", 4).first

    if game.nil?
      render json: {error: "no games to join"}
      return
      # No suitable game found, handle accordingly
    else
      game_id = game.id
      add_user_as_player(game_id)
      # Join the game
    end
    game_id = game.id
    game = Game.find_by_id(game_id)

    message = {
      user_who_joined: session[:user_id],
      some_message: "someone joined the game yay",
      updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
    }

    GameChannel.broadcast_to(game_id, message)
    render json: game, include: {cards: {}, players: { include: :cards } }
  end

  def get_current_user
    game_id = params[:game_id].to_i
    current_user_id = session[:user_id]
    current_player = Player.find_by(user_id: current_user_id, game_id: game_id)
    current_player_id = current_player.id
    render json: current_player_id
  end

def handle_draw_cards
#draw until player has playable card

  game_id = params[:game_id].to_i
  current_user_id = session[:user_id]
  current_player = Player.find_by(user_id: current_user_id, game_id: game_id)
  current_player_id = current_player.id
  puts current_player_id
  draw_cards(game_id, current_player_id)
  game = Game.find_by_id(game_id)
  message = {
    updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
  }
  GameChannel.broadcast_to(game_id, message)
  render json: game, include: {cards: {}, players: { include: :cards } }

end

def play_for_player
  game_id = params[:game_id].to_i
  game = Game.find_by_id(game_id)
  current_user_id = session[:user_id]
  current_player = Player.find_by(user_id: current_user_id, game_id: game_id)

  current_player_id = current_player.id
  do_bot_action(game_id, current_player_id)
  hand_length = Card.where(game_id: game_id, player_id: current_player_id).length
  if hand_length > 0
    set_next_turn(game_id, current_player_id)
  else
    game.update(game_state: "ended")
  end
  game = Game.find_by_id(params[:game_id])
  message = {
    updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
  }
  GameChannel.broadcast_to(game_id, message)
  render json: game, include: {cards: {}, players: { include: :cards } }
end


  def play_card
    #current_player_id will eventually need to change back to sessions[:user_id], but doesnt work now for testing
    game_id = params[:game_id].to_i
    game = Game.find_by_id(game_id)
    current_user_id = session[:user_id]
    current_player = Player.find_by(user_id: current_user_id, game_id: game_id)
    puts `current_player is#{current_player}`
    current_player_id = current_player.id

    card_id = params[:card_id].to_i
    color = params[:color]
    card = Card.find_by_id(card_id)

    if !check_turn(game_id, current_player_id)
      puts 'not ur turn'
      #check if card is playable, other return error cannot play card
      #move card from user hand to discard -> change in_play: true, player_id: nil
      #card_id value
      render json: {error: "not your turn"}
      return
    end

    if !is_card_playable(game_id, card_id)
      puts'not playable'
      render json: {error: "not playable card"}
      return
    end

    puts "card is played, #{card.color} #{card.value}"
    card.update(in_play: true, player_id: nil)
    play_card_effect(card_id, color, game_id, current_player_id)
    hand_length = Card.where(game_id: game_id, player_id: current_player_id).length
    if hand_length > 0
      set_next_turn(game_id, current_player_id)


    else
      game.update(game_state: "ended")

    end
    game = Game.find_by_id(params[:game_id])
    message = {
      updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
    }
    GameChannel.broadcast_to(game_id, message)
    render json: game, include: {cards: {}, players: { include: :cards } }
  end


  def start_game
    Rails.logger.debug( "game is starting")
    game = Game.find_by_id(params[:game_id])
    game_id = params[:game_id]
    players = Player.where(game_id: game_id)
    singleplayer = params[:singleplayer]
    Rails.logger.debug("Game player count is: #{game.player_count}")
    if game.player_count == 4
      Rails.logger.debug( "setting player order.")
      set_player_order(game_id, singleplayer)

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
      game = Game.find_by_id(params[:game_id])
      message = {
        updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
      }

      GameChannel.broadcast_to(game_id, message)
    render json: game, include: {cards: {}, players: { include: :cards } }
    else
      render json: { error: "Not enough players to start the game." }
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


def get_existing_game
  game = Game.find(game_state: "started")
  render json: {
    'game' => game
  }
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

def check_playable_cards_from_hand(game_id, current_player_id)
  hand = Card.where(game_id: game_id, player_id: current_player_id)
  playable_results = []
  hand.each do |card|
    puts "card value is #{card.value} and card color is #{card.color}"
    playable = is_card_playable(game_id, card.id)
    playable_results << playable
  end
  return playable_results
end

def draw_cards(game_id, current_player_id)
  game = Game.find_by_id(game_id)
  last_card = get_last_card_played(game_id)
  puts "Last card value is #{last_card.value}"

  hand = Card.where(game_id: game_id, player_id: current_player_id)
  playable_cards = check_playable_cards_from_hand(game_id, current_player_id)
  Rails.logger.debug("Playable cards? #{playable_cards}")
  has_playable_card = playable_cards.include?(true)

  deck = Card.where(game_id: game_id, is_available: true)
  #IF DECK.LENGTH = 0, FIND ALL CARDS WHERE IN_PLAY: TRUE, CHANGE BACK TO IN_PLAY: FALSE AND IS_AVAILABLE: TRUE AND CHANGE ALL WILD CARDS BACK TO COLOR:BLACK
  if !has_playable_card && (last_card.value == "+2" || last_card.value == "wild draw 4") && game.draw_cards_counter != 0
    game = Game.find_by_id(game_id)
    counter = game.draw_cards_counter
    if deck.length == 0
      discardPile = Card.where(game_id: game_id, in_play: true).where.not(id: last_card.id)
      discardPile.each do |card|
        if ['wild', 'wild draw 4'].include?(card.value)
          card.update(in_play: false, is_available: true, color: 'black')
        else
          card.update(in_play: false, is_available: true)
        end
      end
    end
    deck = Card.where(game_id: game_id, is_available: true)
    new_cards = deck.select { |card| card.is_available}.sample(counter)
    new_card_ids = new_cards.pluck(:id)
    puts "This is new_card_ids #{new_card_ids}"
    Card.where(id: new_card_ids).update_all(player_id: current_player_id, is_available: false)
    game.update(draw_cards_counter: 0)
    hand = Card.where(game_id: game_id, player_id: current_player_id)
    playable_cards = check_playable_cards_from_hand(game_id, current_player_id)
    Rails.logger.debug("Check Playable cards after draw counter? #{playable_cards}")
    has_playable_card = playable_cards.include?(true)
    if !has_playable_card
      draw_cards(game_id, current_player_id)
    end
  elsif !has_playable_card
    if deck.length == 0
      discardPile = Card.where(game_id: game_id, in_play: true).where.not(id: last_card.id)
      discardPile.each do |card|
        if ['wild', 'wild draw 4'].include?(card.value)
          card.update(in_play: false, is_available: true, color: 'black')
        else
          card.update(in_play: false, is_available: true)
        end
      end
    end
    deck = Card.where(game_id: game_id, is_available: true)
    random_card = deck.sample
    Rails.logger.debug("This is the deck: #{deck.inspect}")
    Rails.logger.debug("This is random_card: #{random_card.inspect}")
    if random_card
      random_card.update(is_available: false)
    end
    Rails.logger.debug("This is random_card after update: #{random_card.inspect}")
    Card.where(id: random_card.id).update_all(player_id: current_player_id, is_available: false)
    hand = Card.where(game_id: game_id, player_id: current_player_id)
    new_playable_cards = check_playable_cards_from_hand(game_id, current_player_id)
    has_playable_card = new_playable_cards.include?(true)
    if !has_playable_card
      draw_cards(game_id, current_player_id)
    end
  else

    puts "has playable card"
  end
end

def set_player_order(game_id, singleplayer)
  shuffled_player_order = []
  if (singleplayer)
    players = Player.where(game_id: game_id)
    current_user_id = session[:user_id]
    current_player = Player.find_by(user_id: current_user_id)
    current_user_player = players.find_by(user_id: current_user_id)
    other_players = players.where.not(id: current_user_player.id)
    shuffled_other_players = other_players.pluck(:id).shuffle
    shuffled_player_order = [current_user_player.id] + shuffled_other_players
  else
    players = Player.where(game_id: game_id, is_bot: false)
    player_ids = players.pluck(:id)
    shuffled_players = player_ids.shuffle
    other_players = Player.where(game_id: game_id, is_bot: true)
    shuffled_other_players = other_players.pluck(:id).shuffle
    shuffled_player_order = shuffled_players + shuffled_other_players
  end
  game = Game.find(game_id)
  game.update(player_order: shuffled_player_order)
  game.update(current_player_id: shuffled_player_order[0])
end

def setFirstCardInPlay(game_id)
  deck = get_deck(game_id)
  random_card = deck.find { |card| card.is_available? && card.color != "black" && card.value != "+2"}

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
  while hand.length < 5
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
    current_player_id = next_player
    puts "#{current_player_id}"
  elsif current_game.direction == "counter-clockwise"
    current_player_position = current_game.player_order.index(current_player_id)
    previous_index = (current_player_position - 1) % current_game.player_order.length
    previous_player = current_game.player_order[previous_index]
    current_game.update(current_player_id: previous_player)
    current_player_id = previous_player
    puts "#{current_player_id}"
  end
  game = Game.find_by_id(game_id)
  message = {
    message: "bot-action",
    updated_game: game.as_json(include: { cards: {}, players: { include: :cards } })
  }
  GameChannel.broadcast_to(game_id, message)
  if check_player_is_bot(current_player_id)
    puts "check_player_is_bot returned true"
    game = Game.find_by_id(game_id)
      do_bot_action(game_id, current_player_id)
      
      current_player_id = game.current_player_id
      # 1. get playable cards for the bot
      # 2. play playable cards for the bot if exists
      # 3. or draw until play playable card
      hand_length = Card.where(game_id: game_id, player_id: current_player_id).length
    if hand_length > 0
      set_next_turn(game_id, current_player_id)
      return
    else
      game.update(game_state: "ended")
      return
    end
  end


end

def check_player_is_bot(current_player_id)
  current_player = Player.find_by_id(current_player_id)
  puts "check_player_is_bot returning current_player is #{current_player}"
  if current_player.is_bot == true
    return true
  else
    return false
  end
end

def do_bot_action(game_id, current_player_id)
  Rails.logger.debug("[DEBUGLAND] doing bot action for #{current_player_id}")
  #sleep(2)
  game = Game.find_by_id(game_id)
  hand = Card.where(game_id: game_id, player_id: current_player_id)
  card_ids = hand.pluck(:id)


  playable_card_id = card_ids.find {|card_id| is_card_playable(game_id, card_id) }
  playable_card = Card.find_by_id(playable_card_id)
  Rails.logger.debug("playable card: " + playable_card.to_s)
  if playable_card
    Rails.logger.debug("card is played, #{playable_card.color} #{playable_card.value}")
    playable_card.update(in_play: true, player_id: nil)
    if playable_card.value == "wild" or playable_card.value == "wild draw 4"
      #above hand will still include playable_card even after update because it points to the query that ran before the update
      new_hand = Card.where(game_id: game_id, player_id: current_player_id)
      color_counts = new_hand.where.not(color: "black").group_by(&:color).transform_values(&:count)
      most_common_color = color_counts.max_by { |_, count| count }&.first
      Rails.logger.debug("bot picks most common color which is: " + most_common_color)
    end
    play_card_effect(playable_card_id, most_common_color, game_id, current_player_id)
    game = Game.find_by_id(game_id)
  else
    hand = Card.where(game_id: game_id, player_id: current_player_id)
    Rails.logger.debug("[DEBUGLAND] This is hand before draw #{hand.as_json}")
    draw_cards(game_id, current_player_id)
    hand = Card.where(game_id: game_id, player_id: current_player_id)
    Rails.logger.debug("[DEBUGLAND] This is hand after draw #{hand.as_json}")
    new_card_ids = hand.pluck(:id)
    Rails.logger.debug("This is new_card_ids#{new_card_ids.inspect}")
    playable_card_id = new_card_ids.find do |card|
      result = is_card_playable(game_id, card)
      Rails.logger.debug("Card #{card} is playable: #{result}")
      result
    end
    last_card_played = get_last_card_played(game_id)
    Rails.logger.debug("[DEBUGLAND] last played card is: #{last_card_played.as_json}")
    if !playable_card_id
      Rails.logger.debug("[DEBUGLAND] PLAYABLE CARD ID IS NIL?!?!")
    end
    Rails.logger.debug("This is playable_card_id#{playable_card_id}")
    playable_card = Card.find_by_id(playable_card_id)
    Rails.logger.debug("card is played, #{playable_card.color} #{playable_card.value}")
    playable_card.update(in_play:true, player_id: nil)
    if playable_card.value == "wild" or playable_card.value == "wild draw 4"
      #above hand will still include playable_card even after update because it points to the query that ran before the update
      new_hand = Card.where(game_id: game_id, player_id: current_player_id)
      Rails.logger.debug("what is new hand???, #{new_hand}")
      if new_hand
      color_counts = new_hand.group_by(&:color).transform_values(&:count)
      most_common_color = color_counts.max_by { |_, count| count }&.first
      most_common_color = "red" if most_common_color == "black"
      Rails.logger.debug("bot picks most common color after drawing new cards which is: " + most_common_color)
      else
        most_common_color = "red"
      end
    end
    play_card_effect(playable_card_id, most_common_color, game_id, current_player_id)
    game = Game.find_by_id(game_id)

  end

end

def play_card_effect(card_id, color, game_id, current_player_id)
  card_to_play = Card.find_by_id(card_id)
  current_game = Game.find_by_id(game_id)
  Rails.logger.debug("Card to play is:" + card_to_play.to_s)
  Rails.logger.debug("current game is:" + current_game.to_s)
  if card_to_play.value == "wild"
    card_to_play.update(color: color)
  elsif card_to_play.value == "wild draw 4"
    card_to_play.update(color: color)
    counter_add_four = current_game.draw_cards_counter.to_i + 4
    current_game.update(draw_cards_counter: counter_add_four)
  elsif card_to_play.value == "reverse"
    if(current_game.direction == "clockwise")
      current_game.update(direction: "counter-clockwise")
    else
      current_game.update(direction: "clockwise")
    end
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
