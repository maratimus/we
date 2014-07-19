

define(['we','ember'], function (we) {

 App.PostController = Ember.ObjectController.extend({
    isEditing: false,
    loadedComments: 4,

    shareInGroups: null,
    shareWithUsers: null,

    metadata: {
      commentCount: 0
    },
    hasMoreComments: function(){
      if(this.get('metadata.commentCount') > this.loadedComments){
        return true;
      }else{
        return false;
      }
    }.property('metadata.commentCount', 'loadedComments'),
    commentCount: function(){
      return this.get('metadata.commentCount');
    }.property('metadata.commentCount'),

    // preSelectedValues: function(){
    //   var sharedWith = this.get('sharedWith');

    //   return ;
    // }.property('sharedIn','sharedWith'),

    isFlipped: false,
    flipClass: function(){
      if(this.get('isFlipped')){
        return 'isFlipped';
      }else{
        return ' ';
      }
    }.property('isFlipped'),

    init: function(){
      this._super();
      var _this = this;
      var comments = this.get('comments');
      var store = this.get('store');

      if(!comments){
        this.set('comments',[]);
        return;
      }
      if(comments.length){
        var commentModels = this.get('store').pushMany('comment',comments);
        this.set('comments', commentModels);
      }
      this.set('metadata',this.get('content._data.meta'));

      this.loadAndFetchSharedWithObjects();
    },
    loadAndFetchSharedWithObjects: function(){
      var sharedWith = this.get('sharedWith');
      var sharedIn = this.get('sharedIn');
      var store = this.get('store');
      var _this = this;

      if(!sharedWith){
        this.set('sharedWith',[]);
        sharedWith = [];
      }
      if(!sharedIn){
        this.set('sharedIn',[]);
        sharedIn = [];
      }
      // TODO change this findMany function to something better
      var map = Ember.ArrayPolyfills.map;
      var promises = map.call(sharedWith, function(id) {
        return store.find('user', id);
      }, this);
      var promisesGroup = map.call(sharedIn, function(id) {
        return store.find('group', id);
      }, this);
      Ember.RSVP.all(promises).then(function(shareWithUsers){
        Ember.RSVP.all(promisesGroup).then(function(shareInGroups){
          _this.set('shareWithUsers',shareWithUsers);
          _this.set('shareInGroups',shareInGroups);
        });
      });
    },
    actions: {
      edit: function() {
        this.set('isEditing', true);
      },
      cancel: function() {
        this.set('isEditing', false);
        // rollback changes
        this.get('model').rollback();
      },
      save: function(){
        var _this = this;
        // // save the model
        _this.get('model').save().then(function(post){
          // updated!
          _this.set('isEditing', false);
          _this.loadAndFetchSharedWithObjects();
        });
      },
      deleteItem: function(){
        var userConfirmation = confirm( we.i18n("Are you sure you want to delete the post?") );
        if (userConfirmation === true) {
          var model = this.get('model');
          model.deleteRecord();
          model.save();
        }
      },
      loadAllComments: function(){
        var _this = this;
        this.store.find('comment',{
          post: this.get('id'),
          limit: 1000
        }).then(function(comments){
          if(comments){
            _this.setProperties({
              'comments': comments,
              'loadedComments': comments.get('length'),
              'metadata.commentCount': comments.get('length')
            });
          }
        });
      },

      newCommentCreated: function(comment){
        this.get('comments').pushObject(comment);

        var commentCount = this.get('metadata.commentCount');
        commentCount++;
        this.set('metadata.commentCount',commentCount);
      },

      showSharedWith: function(){
        console.warn('TODO! show shared with ...', this.get('shareWithUsers'), this.get('shareInGroups'));
      },
      onChangeSelect2Data: function(e){
        if(e.removed){
          switch(e.removed.model) {
            case 'user':
              this.get('sharedWith').removeObject(e.removed.id);
              break;
            case 'group':
              this.get('sharedIn').removeObject(e.removed.id);
              break;
          }
        }
        if(e.added){
          switch(e.added.model) {
            case 'user':
              this.get('sharedWith').pushObject(e.added.id);
              break;
            case 'group':
              this.get('sharedIn').pushObject(e.added.id);
              break;
          }
        }
      },
      onPasteInBody: function(e){
        var model = this.get('model');
        var data = e.originalEvent.clipboardData.getData('text/plain');
        if(we.utils.isValidUrl(data)){
          // video url
          if(we.utils.isVideoUrl(data)){
            // dont add duplicated links
            if(!model.get('videos').contains(data)){
              model.get('videos').pushObject(data);
            }
          }else{
            //other url
            if(!model.get('videos').contains(data)){
              model.get('links').pushObject(data);
            }
          }
        }
      },
      onRemoveVideo: function(videoUrl, element){
        this.get('videos').removeObject(videoUrl);
      }
    }
  });

});
