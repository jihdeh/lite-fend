$(document).ready(function() {
  $('#search').submit(function(event) {
    event.preventDefault();
    $('.loading').removeClass('hide_something');
    var getUsernameValue = $('.searchInput').val();
    getSearchResult(getUsernameValue.toUpperCase());
  });

  $('#voteModal').on('shown.bs.modal', function() {
    var getUsername = $('.theUsername').text();
    $('#contestantUsername').text(getUsername);
  });

  $('#cast_btn').on('click', function() {
    var getUsername = $('.theUsername').text();
    var getNumberOfVotes = $('#numberOfVotes_input')
      .val()
      .trim();

    if (isNaN(+getNumberOfVotes) || +getNumberOfVotes < 1) {
      //display error
      console.log('block');
      $('.information').text('Numbers only please');
      toastr.warning('Numbers only please');
      return;
    } else {
      $('#cast_btn').attr('disabled', 'disabled');
      $('#cast_btn').text('Loading payment module');
      loadPayStack(getUsername, +getNumberOfVotes);
    }
  });
});
// theUsername
var loadPayStack = function(
  username,
  voteCount,
  email = 'vote@soundit.africa'
) {
  var handler = window.PaystackPop.setup({
    key: 'pk_test_2f18b792a4e8f36bb7a5bcba1bd2e8d68add7603',
    email: 'vote@soundit.africa',
    amount: 5000 * Number(voteCount), //in kobo
    ref: '' + Math.floor(Math.random() * 1000000000 + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
    metadata: {
      custom_fields: [
        {
          display_name: 'Username',
          variable_name: 'username',
          value: username
        },
        {
          display_name: 'Votes',
          variable_name: 'votes',
          value: voteCount
        }
      ]
    },
    callback: function(response) {
      $('.information').text('Successfully Casted vote for ' + username);
      $('#cast_btn').text('Cast Vote');
      $('#cast_btn').removeAttr('disabled');
      toastr.success('Alert!', 'Successfully casted vote', { timeOut: 5000 });
      $.post(
        'https://hooks.slack.com/services/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',
        {
          text: 'Lite Someone voted for' + username + ' with' + voteCount,
          channel: '#soundit',
          username: 'New Vote - Lite',
          icon_emoji: ':incoming_envelope:'
        },
        function(data, status) {
          console.log('done', data, status);
        }
      );
    },
    onClose: function() {
      alert('window closed');
      $('#cast_btn').text('Cast Vote');
      $('#cast_btn').removeAttr('disabled');
    }
  });
  handler.openIframe();
};

var getSearchResult = function(username) {
  var defaultUsername = username || '';
  $.get(
    'http://localhost:6500/api/searchContestant?username=' + defaultUsername,
    function(data, status) {
      if (!data.length) {
        $('.loading').text('No Contestant found by that username');
        return;
      }
      if (data.length > 1) {
        data.forEach(function(contestant) {
          $('#displayResult').append(constructHtmlResult(contestant));
        });
        $('.loading').addClass('hide_something');
        return;
      } else {
        data.forEach(function(contestant) {
          $('#displayResult').html(constructHtmlResult(contestant));
        });
        $('.loading').addClass('hide_something');
        return;
      }
    }
  );
};

var constructHtmlResult = function(contestant) {
  return (
    '<div class="col-sm-6 col-md-4 col-lg-3"><div class="col-contestant-result">' +
    '<iframe width="100%" height="200px" src="' +
    contestant.contestantVideo[0] +
    '" title="Contestant video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />' +
    '<p class="col-contestant-result-name"> Name: <span class="col-contestant-result__right"> ' +
    contestant.firstName +
    ' ' +
    contestant.lastName +
    ' </span></p>' +
    '<p class="col-contestant-result-location"> Location: <span class="col-contestant-result__right">' +
    contestant.state +
    ' ' +
    contestant.country +
    '</span></p>' +
    '<p class="col-contestant-result-code">Username: <span class="col-contestant-result__right theUsername">' +
    contestant.username +
    '</span></p>' +
    '<p class="col-contestant-result-code">' +
    '<a href="https://www.soundit.africa/rsg/' +
    contestant.username +
    '" target="_blank" style="color:#fe920f">Profile Link</a></p>' +
    '<div class="share-channel"><div class="share-channel-vote" data-toggle="modal" data-target="#voteModal"><i class="fas fa-check" /><span>Vote</span></div>' +
    '<div class="share-channel-social">' +
    '<i class="vote-social-icons vote-social-icons-fb fab fa-facebook fa-2x" />' +
    '<i class="vote-social-icons vote-social-icons-tw fab fa-twitter fa-2x" />' +
    '<i class="vote-social-icons vote-social-icons-ig fab fa-instagram fa-2x" />' +
    '</div></div></div>'
  );
};
