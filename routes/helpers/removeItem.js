const _ = require("lodash");

// INPUT:
// allGroupThemes, groupThemeId

// RETURN
// [ modififedGroupThemes, itemDeleted ]

module.exports = function(allGroupThemes, group_theme_id) {
  const itemDeleted = _.find(allGroupThemes, function(item) {
    return item._id.toString() === group_theme_id;
  });

  const modifiedGroupThemes = _.remove(allGroupThemes, function(item) {
    return item._id.toString() !== group_theme_id;
  });

  return { modifiedGroupThemes, itemDeleted };
};
