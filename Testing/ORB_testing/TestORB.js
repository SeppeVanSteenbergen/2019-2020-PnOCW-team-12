function getTranslation(basePicture, picture, width, height, threshold){
    let basePictureGray = grayScaleImgData(basePicture.data);
    let pictureGray = grayScaleImgData(picture.data);

    let baseCorners = FASTDetector(basePictureGray, width, height, threshold)
    let pictureCorners = FASTDetector(pictureGray, width, height, threshold)

    let brief = new Brief(520);

    let baseDescriptor = brief.getDescriptors(basePictureGray, width, baseCorners)
    let pictureDescriptor = brief.getDescriptors(pictureGray, width, pictureCorners)

    let trans = {x: 0, y: 0}

    let matches = brief.reciprocalMatch(
        baseCorners,
        baseDescriptor,
        pictureCorners,
        pictureDescriptor
    )

    let selectedCount = 0
    for (let i = 0; i < matches.length; i++) {
        if (matches[i].confidence > 0.75) {
            selectedCount++
            trans.x += matches[i].keypoint1[0] - matches[i].keypoint2[0]
            trans.y += matches[i].keypoint1[1] - matches[i].keypoint2[1]
        }
    }
    if (selectedCount > 0) {
        trans.x = trans.x / selectedCount
        trans.y = trans.y / selectedCount
    }

    return trans;
}