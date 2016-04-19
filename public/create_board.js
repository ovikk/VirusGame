var w = 10;
				var h = 10;
				var current_player = 1;
				var moves_made = 0;
				 
				 
				var current_field = new Array(w);
				for (i=0;i<w;i++) {
					current_field[i]=new Array(h);
					for (var j=0;j<h;j++) {
						current_field[i][j]=0;
					}
				}
				 
				var current_life_field = new Array(w);
				for (var i = 0; i < w; i++) {
					current_life_field[i] = new Array(h);
					for (j=0;j<h;j++) {
						current_life_field[i][j]=0;
					}
				}
				current_life_field[0][0] = 1;
				current_life_field[9][9] = 2;
				current_field[0][0] = 1;
				current_field[9][9] = 3;
				 
				 
				function fill() {
					str = ""
				 
					for (i = 0; i < w; i++) {
						str = str + "<tr>";
						for (var j = 0; j < h; j++) {
							str = str + "<td > " +
								"<img id = " + i + "_" + j + " class = cell  src=imgs/blanc_green.png onclick=clickclick(" + i + "," + j + ")> " +
								"</td>"
						}
				 
						str = str + "</tr>"
				 
					}
					document.getElementById('board').innerHTML = str;
					//console.log(document.getElementById('board').innerHTML);
					//alert(document.getElementById('board').innerHTML)
					refresh_field(current_field)
				}
