(function($){

  $.fn.extend({

    mygame: function(size, options){

      //Parameters by default
      var settings = $.extend({
        gameObject : this.attr('id'),
        blockSize : size ,
        boardSize : (4 * size) + 40,
        score : 0,
        flag_move : false,
        flag_gameover : false,
        callback : null
      }, options);

      if ( $.isFunction( settings.callback ) ) {
        settings.complete.call( this );
      }

      //------------------------------ Init Game -------------------------//

      //Initialisation Board
      var init_board = function(){
        //Board
        $('#' + settings.gameObject + '').append('<div id=board></div>');
        $('#board').css({"width":settings.boardSize + "px","height": settings.boardSize + "px"});

        //Square
        for (var i = 0; i < 4; i++) {
            $('#board').append('<div class="row"></div>');
            for (var j = 0; j < 4; j++) {
              $('div.row:nth-child('+(i+1)+')').append('<div class="square-container" data-x="'+j+'" data-y="'+i+'" ></div');
              $('div.square-container').css({"width":size+"px", "height":size+"px"});
            }
          }

        //Set score
        $('#score').text("----");
      }

      //init Tile Value and Coordonate
      var init_tile = function(tile_number){
          for (var i = 0; i < tile_number; i++) {
            var random_x = Math.floor(Math.random() * 4);
            var random_y = Math.floor(Math.random() * 4);
            var random_val =  Math.random() < 0.5 ? 2 : 4;
            add_tile(random_x, random_y, random_val);
          }
      }

      //Add tile to board
      var add_tile = function(x,y, val){
        if (!$('div[data-x='+x+'][data-y='+y+']').hasClass( "tile" )){
          $('div[data-x='+x+'][data-y='+y+']').addClass("new_tile tile").text(val);
          game_over();
        } else {
          init_tile(1);
        }
      }

      //Test game over
      var game_over = function(){
        var count = 0;

        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
              if ($('div[data-x='+i+'][data-y='+j+']').hasClass( "tile" )){
                count++;
              }
            }
          }
          if (count == 16){
            console.log(count);
            $('#board').replaceWith('<div id=board class="gameover">GAME OVER</div>')
            $('#board').height(settings.boardSize + "px").width(settings.boardSize + "px");

          }
      }

      //------------------------------ Move ----------------------------//

      var move_all_down = function(){
        for (var j = 3; j >= 0; j--) {
          for (var i = 0; i <= 3; i++) {
            if ($('div[data-x='+i+'][data-y='+j+']').hasClass("tile")){
              move_down(i,j);
            }
          }
        }
      }

      var move_down = function(x, y){
          var value_initial = $('div[data-x='+x+'][data-y='+y+']').text();
          if (y < 3 && !$('div[data-x='+x+'][data-y='+(y+1)+']').hasClass("tile"))
          {
                  $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile ").text("");
                  $('div[data-x='+x+'][data-y='+(y+1)+']').addClass("tile").text(value_initial);
                  settings.flag_move = true;
                  move_down(x, y+1)
          }
          else if($('div[data-x='+x+'][data-y='+(y+1)+']').hasClass("tile")
                    &&  $('div[data-x='+x+'][data-y='+(y)+']').text() ==
                        $('div[data-x='+x+'][data-y='+(y+1)+']').text() )
                        {
                            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
                            $('div[data-x='+x+'][data-y='+(y+1)+']').text(value_initial * 2);

                            if (parseInt($('div[data-x='+x+'][data-y='+(y+1)+']').text()) > settings.score){
                              settings.score = parseInt($('div[data-x='+x+'][data-y='+(y+1)+']').text());
                              $('#score').text(settings.score);
                            }
                            settings.flag_move = true;
          }
      }

      var move_all_top = function(){
        for (var j = 0; j <= 3; j++) {
          for (var i = 0; i <= 3; i++) {
            if ($('div[data-x='+i+'][data-y='+j+']').hasClass("tile")){
              move_top(i,j);
            }
          }
        }
      }

      var move_top = function(x, y){
          var value_initial = $('div[data-x='+x+'][data-y='+y+']').text();

          if (y > 0 && !$('div[data-x='+x+'][data-y='+(y-1)+']').hasClass("tile"))
          {
            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
            $('div[data-x='+x+'][data-y='+(y-1)+']').addClass("tile").text(value_initial);
            settings.flag_move = true;
            move_top(x, y-1)
          }
          else if($('div[data-x='+x+'][data-y='+(y-1)+']').hasClass("tile")
                    &&  $('div[data-x='+x+'][data-y='+(y)+']').text() ==
                        $('div[data-x='+x+'][data-y='+(y-1)+']').text() )
                        {
                            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
                            $('div[data-x='+x+'][data-y='+(y-1)+']').text(value_initial * 2);

                            if (parseInt($('div[data-x='+x+'][data-y='+(y-1)+']').text()) > settings.score){
                              settings.score = parseInt($('div[data-x='+x+'][data-y='+(y-1)+']').text());
                              $('#score').text(settings.score);
                            }
                            settings.flag_move = true;
          }
      }

      var move_all_right = function(){
        for (var i = 3; i >= 0; i--) {
          for (var j = 0; j <= 3; j++) {
            if ($('div[data-x='+i+'][data-y='+j+']').hasClass("tile")){
              move_right(i,j);
            }
          }
        }
      }

      var move_right = function(x, y){
          var value_initial = $('div[data-x='+x+'][data-y='+y+']').text();

          if (x < 3 && !$('div[data-x='+(x+1)+'][data-y='+(y)+']').hasClass("tile"))
          {
            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
            $('div[data-x='+(x+1)+'][data-y='+y+']').addClass("tile").text(value_initial);
            settings.flag_move = true;
            move_right(x+1, y)
          }
          else if($('div[data-x='+(x+1)+'][data-y='+y+']').hasClass("tile")
                    &&  $('div[data-x='+x+'][data-y='+(y)+']').text() ==
                        $('div[data-x='+(x+1)+'][data-y='+y+']').text() )
                        {
                            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
                            $('div[data-x='+(x+1)+'][data-y='+y+']').text(value_initial * 2);

                            if (parseInt($('div[data-x='+(x+1)+'][data-y='+y+']').text()) > settings.score){
                              settings.score = parseInt($('div[data-x='+(x+1)+'][data-y='+y+']').text());
                              $('#score').text(settings.score);
                            }

                            settings.flag_move = true;
          }
      }

      var move_all_left = function(){
        for (var i = 0; i <= 3; i++) {
          for (var j = 0; j <= 3; j++) {
            if ($('div[data-x='+i+'][data-y='+j+']').hasClass("tile")){
              move_left(i,j);
            }
          }
        }
      }

      var move_left = function(x, y){
          var value_initial = $('div[data-x='+x+'][data-y='+y+']').text();

          if (x > 0 && !$('div[data-x='+(x-1)+'][data-y='+y+']').hasClass("tile"))
          {
            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
            $('div[data-x='+(x-1)+'][data-y='+y+']').addClass("tile").text(value_initial);
            settings.flag_move = true;
            move_left(x-1, y)
          }
          else if($('div[data-x='+(x-1)+'][data-y='+y+']').hasClass("tile")
                    &&  $('div[data-x='+x+'][data-y='+y+']').text() ==
                        $('div[data-x='+(x-1)+'][data-y='+y+']').text() )
                        {
                            $('div[data-x='+x+'][data-y='+y+']').removeClass("new_tile tile").text("");
                            $('div[data-x='+(x-1)+'][data-y='+y+']').text(value_initial * 2);

                            if (parseInt($('div[data-x='+(x-1)+'][data-y='+y+']').text()) > settings.score){
                              settings.score = parseInt($('div[data-x='+(x-1)+'][data-y='+y+']').text());
                              $('#score').text(settings.score);
                            }

                            settings.flag_move = true;
          }
      }

      //------------------------------ Event ---------------------------//

      $('body').keydown(function(e) {
        switch(e.keyCode) {
          case 40:
            move_all_down();
            break;
          case 38:
            move_all_top();
            break;
          case 39:
            move_all_right();
            break;
          case 37:
            move_all_left();
            break;
        }
        if (settings.flag_move){
          init_tile(1);
          settings.flag_move = false;
        }
      })

      //New Game
      $('#newgame_btn').click(function(){
        $('#mygame').replaceWith('<div id="mygame"></div>');
        init_board();
        init_tile(2);
      })

      //Main`
      init_board();
      init_tile(2);

    }

  });
})(jQuery);
