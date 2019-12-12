export default class Point{
    constructor(x, y){
        this.x = x
        this.y = y
        this.nearbyPoints = []
    }

    addNearbyPoint(point){
        if(!this.nearbyPoints.includes(point)){
            this.nearbyPoints.push(point)
        }
    }

    isPoint(pList){
        if(pList[0] == this.x && pList[1] == this.y)
            return true
        return false
    }
}