class CreateGames < ActiveRecord::Migration[6.1]
  def change
    create_table :games do |t|
      t.string :direction
      t.integer :current_player_id
      t.integer :player_count
      t.string :game_state
      t.boolean :bot_fill
      t.integer :draw_cards_counter
      t.integer :player_order, array: true, default: []
      t.integer :player_ranking, array:true, default: []
      t.timestamps
    end
  end
end
