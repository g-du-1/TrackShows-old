const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Show = require("../../models/show");

// TODO Pagination
// TODO Research pros and cons for server or db vs client side sorting

// @route  GET api/shows
// @desc   Get User's Shows
// @access Private

router.get("/", auth, (req, res) => {
  let sortBy = req.query.sortBy;
  let sortOrder = req.query.sortOrder;

  let sortObj = {};
  sortObj[sortBy] = sortOrder;

  Show.find({ user: req.user.id })
    .sort(sortObj)
    .then((shows) => res.json(shows));
});

// Please ignore. Experimental feature.
// TODO Improve regex
// router.get("/recents", (req, res) => {
//   const fs = require("fs");
//   const user = require("os").userInfo().username;
//   const path = `C:\\Users\\${user}\\AppData\\Roaming\\vlc\\vlc-qt-interface.ini`;
//   var content = fs.readFileSync(path, "utf8");
//   var recentsBlock = content
//     .match(/(?<=RecentsMRL\]).*(?=\[Update\])/gis)
//     .join();
//   recentsBlock = recentsBlock.replace(/%20/g, ".");
//   var reNames = /(([a-zA-Z.-]+)(\d+)?([a-zA-Z.]+(E\d+|(S\d+E\d+))))(?!.*\1)/gi;
//   var reTimes = /(?<=times=).*/g;
//   var namesResult = recentsBlock.match(reNames);
//   var timesResult = recentsBlock.match(reTimes)[0];
//   return res.json({ names: namesResult, times: timesResult });
// });

// @route  POST api/shows
// @desc   Add a show
// @access Private

router.post("/", auth, (req, res) => {
  const newShow = new Show({
    name: req.body.name,
    mazeId: req.body.mazeId,
    lastEpisode: req.body.lastEpisode,
    nextEpisode: req.body.nextEpisode,
    status: req.body.status,
    thumbnail: req.body.thumbnail,
    allEpisodes: req.body.allEpisodes,
    lastSeen: req.body.lastSeen,
    lastAiredIndexByDate: req.body.lastAiredIndexByDate,
    remainingNew: req.body.remainingNew,
    hasNewSpecial: req.body.hasNewSpecial,
    user: req.body.user,
  });

  newShow.save().then((show) => res.json(show));
});

// @route  PUT api/shows/:id
// @desc   Update a show
// @access Private

router.put("/:id", auth, (req, res) => {
  Show.findByIdAndUpdate(req.params.id, req.body, { useFindAndModify: false })
    .then((show) => res.json({ msg: "Updated successfully" }))
    .catch((err) =>
      res.status(400).json({ error: "Unable to update the Database" })
    );
});

// @route  DELETE api/shows/:id
// @desc   Delete a show
// @access Private

router.delete("/:id", auth, (req, res) => {
  Show.findById(req.params.id)
    .then((item) => item.remove().then(() => res.json({ success: true })))
    .catch((err) => res.status(400).json({ success: false }));
});

module.exports = router;
