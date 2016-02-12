describe("Classy", function() {

  var classy;

  beforeAll(function() {
    MyClass = Classy('MyClass');
  });

  describe("when Classy constructor is instantiated", function() {

    it("should return a Classy instance", function() {
      expect(MyClass instanceof Classy.constructor).toBeTruthy();
    });

    describe("when Classy instance is instantiated", function() {
      it("should return a ClassyWrapper (MyClass Constructor)", function() {
        var myClassInstance = MyClass();

        expect(myClassInstance instanceof MyClass.constructor).toBeTruthy();
      });
    });

    describe("when MyClass instance is $add", function() {
      it("should push itself inside MyClass.$data", function() {
        var myClassInstance = MyClass();

        myClassInstance.$add();

        expect(MyClass.$data()).toContain(myClassInstance);
      });
    });

  });



  // it("should be possible to resume", function() {
  //   player.resume();
  //   expect(player.isPlaying).toBeTruthy();
  //   expect(player.currentlyPlayingSong).toEqual(song);

  // // demonstrates use of spies to intercept and test method calls
  // it("tells the current song if the user has made it a favorite", function() {
  //   spyOn(song, 'persistFavoriteStatus');

  //   player.play(song);
  //   player.makeFavorite();

  //   expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  // });

  // //demonstrates use of expected exceptions
  // describe("#resume", function() {
  //   it("should throw an exception if song is already playing", function() {
  //     player.play(song);

  //     expect(function() {
  //       player.resume();
  //     }).toThrowError("song is already playing");
  //   });
  // });
});
