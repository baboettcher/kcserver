const _ = require("lodash");

// INPUT:
// allGroupThemes, groupThemeId

// RETURN
// [ modififedGroupThemes, itemToDelete ]

module.exports = function(allGroupThemes, group_theme_id) {
  const itemToDelete = _.find(allGroupThemes, function(item) {
    return item._id.toString() === group_theme_id;
  });

  const modififedGroupThemes = _.remove(allGroupThemes, function(item) {
    return item._id.toString() !== group_theme_id;
  });

  return { modififedGroupThemes, itemToDelete };
};

/* 

    // 3. remove old theme
    const itemToDelete = _.find(allGroupThemes, function(item) {
      return item._id.toString() === req.body.group_theme_id;
    });

    const allGroupThemes_MODIFIED = _.remove(allGroupThemes, function(item) {
      return item._id.toString() !== req.body.group_theme_id;
    });

    allGroupThemes_MODIFIED.push(updatedTheme_test2_toObject);
 */
