var Player; 

$(function(){
	Parse.initialize("ZzMYjfOLOLxsWRX8NjvfWHYuT1GFIJb0XYNY5MfX", "GArtoY76I0N9UKAxq6ccgfuyxXY0W6xloBWjbEUh");
	Player = Parse.Object.extend("Player");
	$('#enter').click(save_data);
});

function save_data()
{
	var p1 = new Player();
	var name = $('#name').val();
	p1.save({player_name: name}, {success: show_success});
}

function show_success()
{
	console.log('data saved to parse');
	window.location.href = "./checkers.html";
}