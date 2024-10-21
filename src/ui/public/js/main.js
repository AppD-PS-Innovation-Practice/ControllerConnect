$(document).ready(function () {
  $('.delete-controller').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');

    $.ajax({
      type: 'DELETE',
      url: '/controllers/'+id,
      success: function (response){
        alert('Deleting controller');
        window.location.href='/controllers/';
      },
      error: function(err){
        console.error(err);
      }
    });
  });    
  $('.delete-user').on('click', function (e) {
    $target = $(e.target);
    const id = $target.attr('data-id');

    $.ajax({
      type: 'DELETE',
      url: '/users/' + id,
      success: function (response) {
        alert('Deleting user');
        window.location.href = '/users/';
      },
      error: function (err) {
        console.error(err);
      }
    });
  });
});