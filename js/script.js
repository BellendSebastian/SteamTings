(function () {

    var user = {};
    var games = [];

    lookupUser = function(username) {
        user = {};
        var jUrl =  "http://query.yahooapis.com/v1/public/yql?q=use%20'https%3A%2F%2Fgithub.com%2Fdisavian%2F" +
                    "yql-tables%2Fraw%2Fmaster%2Fsteam%2Fsteam.community.player.profile.xml'%20as%20steam.community" +
                    ".player.profile%3B%20select%20*%20from%20steam.community.player.profile%20where%20customurl%3D'" +
                    username + "'&format=json";
        $.ajax({
            url: jUrl,
            dataType: 'jsonp',
            success: function(data) {
                if (data.query.results) {
                    user = data.query.results.profile;
                    getGames(username);
                } else {
                    error("Failed to retrieve user information for \"" + username + "\". Did you enter the correct username?<br/><br/>Your username is part of your profile URL. e.g.:<br/>http://steamcommunity.com/id/<strong>username</strong>");
                }
            }
        });
    };

    getGames = function(username) {
        games = [];
        var t = "http://pipes.yahoo.com/pipes/pipe.run?Username=" + username + "&_id=3590b205b2df8b2e9376fdd7e4e9a969&_render=json";
        $.ajax({
            url: t,
            success: function(data) {
                games = data.value.items[0].games.game;
                displayGames(games);
                updateUrl(username);
            }
        });
    };

    countUnplayed = function(gameList) {
        var c = 0;
        $(gameList).each(function(i,v) {
            if (this.hoursOnRecord === undefined) {
                c++;
            }
        });
        return c;
    };

    checkContainer = function() {
        $(".for-content").fadeOut(0);
        $(".for-content").html('<div class="row content"><header><h2></h2><p class="small"></p></header><div class="well recommendation"></div><div class="well"><h2>Unplayed Games</h2><ul class="game-list"></ul></div></div>');
        return $(".content");
    };

    displayGames = function(gameList) {
        var unplayed = countUnplayed(gameList);
        var percentage = Math.ceil(unplayed / gameList.length * 100);
        var container = checkContainer();
        var randomGame = getRandomGame(gameList);


        container.find("header").prepend("<img src='" + user.avatarIcon + "' alt='Profile image for " + user.steamID + "' class='pull-left' />");
        container.find("header").children("h2").html("Results for <a href='http://steamcommunity.com/id/" + user.customURL + "' target='_blank'>" + user.steamID + "</a> (" + user.customURL + ")");
        container.find("header").children("p").html(gameList.length + " game(s) found, out of which " + unplayed + " (" + percentage + "%) are unplayed.");
        container.find(".recommendation").html("<h2>Maybe you should play <a href='" + randomGame.storeLink + "'>" + randomGame.name + "</a>?</h2>");
        $(gameList).each(function(i,v) {
            if (this.hoursOnRecord === undefined) {
                hideLoading();
                container.find(".game-list").append("<li><a href='" + this.storeLink + "'><img src='" + this.logo + "' alt='" + this.name + "'/></a></li>");
            }
        });
        $(".for-content").fadeIn(400);
        $(".for-recommendation").fadeIn(400);
    };

    getRandomGame = function(gameList) {
        var unplayed = [];
        $(gameList).each(function(i,v) {
            if (this.hoursOnRecord === undefined) {
                unplayed.push(this);
            }
        });
        return unplayed[Math.floor(Math.random() * unplayed.length)];
    };

    updateUrl = function(username) {
        // window.location.href = window.location.origin + window.location.pathname + "?username=" + username;
    };

    showLoading = function() { $(".loading").fadeIn(500); };
    hideLoading = function() { $(".loading").fadeOut(500); };

    error = function(str) {
        hideLoading();
        $(".error-container").prepend("<div class='alert alert-error'><button type='button' class='close' data-dismiss='alert'>×</button><h4>Error</h4><p class='error-text'>" + str + "</p></div>");
    };

    window.graph = function() {

    };

    drawChart = function(data) {
        var chart, options;
        options = {
            backgroundColor: 'transparent',
            titlePosition: 'none',
            chartArea: {
                width: "75%",
                height: "80%"
            }
        };
        chart = new google.visualization.BarChart(document.getElementById("play_tools_chart"));
        chart.draw(data, options);
    };

    window.init = function() {
        $("#steamId").on("submit", function(e) {
            e.preventDefault();
            if ($("#username").val()) {
                showLoading();
                lookupUser(escape($("#username").val()));
            } else {
                error("You must enter a username.Your username is part of your profile URL. e.g.:<br/>http://steamcommunity.com/id/<strong>username</strong>");
            }
        });
    };

}).call(this);
