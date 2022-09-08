class PriorityQueue{
    constructor(){
        this.arr = []
    }

    add(HTMLelem, dist){
        this.arr.push({elem: HTMLelem, dist: dist});
        this.arr.sort(function (a,b){ a.dist - b.dist})
    }
}