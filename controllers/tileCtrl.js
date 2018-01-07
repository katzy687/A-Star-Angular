icvApp.controller('TileCtrl',
  ['$scope',
    '$q',
    '$timeout',
    '$interval',
    '$mdDialog',
    '$state',
    'PathDataService',
    function ($scope, $q, $timeout, $interval, $mdDialog, $state, PathDataService) {

      ////===================== set initial tiles ===========================
      this.$onInit = () => {
        // main array used in view
        this.tiles = [];

        // chunked tiles will function as the pathfinding graph
        this.chunkedTileArr = [];

        // to clear path interval on every 'Go' press
        this.pathInterval;

        // stat object to hold the path report info
        this.stats = { totalSteps: null, performanceTime: null };

        this.customColors = { default: '#03A9F4', wall: '#5D4037', path: 'fuchsia'  }
        this.defaultBackup = { default: '#03A9F4', wall: '#5D4037', path: 'fuchsia'  }

        this.initTiles().then(() => {
          console.log('tiles ready');
          console.log(this.tiles);
          this.tiles[0].isStart = true;
          this.tiles[143].isEnd = true;
        });
      }

      this.initTiles = (() => {
        // return promise to allow function to work
        return $q((resolve, reject) => {
          // fill up tiles array
          for (var i = 0; i < 144; i++) {
            this.tiles.push({
              id: i,
              isWall: false,
              isStart: false,
              isEnd: false,
              isPath: false
            });
          }
          // resolve promise
          if (this.tiles.length === 144) {
            resolve(console.log('array ready'));
          }
          else {
            reject(console.log('there was a problem'));
          }

        })

      })

      ////===================== pathfinding ===========================

      // gather graph info and set path
      this.go = () => {
        this.prepAndInitGraph();
        let result = this.getPathResultNodes();
        let pathIndices = this.getPathIndices(result);

        this.animatePath(pathIndices);

      }

      this.prepAndInitGraph = () => {
        // simple slice so as not to mutate the original array
        const tileArrCopy = this.tiles.slice();

        // split into chunks of 12
        splitArrIntoChunks(tileArrCopy, this.chunkedTileArr, 12);

        // map chunkedArr into binary signals for closed walls
        let mappedWalls = this.mapWallsToBinaryGraph(this.chunkedTileArr);

        // initialize new graph
        this.graph = new Graph(mappedWalls);
      }

      this.getPathResultNodes = () => {
        // retrieve matrix coordinates of Start and End nodes
        const coordinates = this.getStartEndCoordinates(this.tiles);
        let start = this.setGridNode(coordinates.start);
        let end = this.setGridNode(coordinates.end);

        // pathFinding Result leveraging the A* algorithm
        let result = astar.search(this.graph, start, end);

        return result;
      }

      this.getPathIndices = (result) => {
        // gather the coordinates from the path nodes
        const resultCoordinates = result.map((node) => {
          let coordinates = [];
          coordinates.push(node.x, node.y);
          console.log('coordinates', coordinates);
          return coordinates;
        })

        // convert coordinates into indices of the original array
        const resultIndices = resultCoordinates.map((coordinateArr) => {
          let index = this.getIndexFromCoordinates(coordinateArr);
          return index;
        })
        console.log(resultIndices);
        // copy to total steps to report
        this.stats.totalSteps = resultIndices.length;
        return resultIndices;
      }

      this.animatePath = (pathIndices) => {

        // clear each time
        this.clearPath();
        this.setPathPerformanceTime(pathIndices)

      }

      this.setPathPerformanceTime = (pathIndices) => {
          const t0 = performance.now();
          this.pathInterval = this.ArrayPlusDelay(pathIndices, this.setPath, 100);
          const t1 = performance.now();

          console.log('path took ' + (t1 - t0).toFixed(3) + ' milliseconds');
          this.stats.performanceTime = (t1 - t0).toFixed(3);
      }

      this.changeStateWithDelay = () => {
        $timeout(() => {
          $state.go('result');
        }, 200)
      }


      this.ArrayPlusDelay = (array, delegateFn, delay) => {
        var i = 0

        // seed first call and store interval (to clear later)
        interval = $interval(() => {
          // each loop, call passed in function
          delegateFn(array[i]);

          // increment, and if we're past array, clear interval
          if (i++ >= array.length - 1) {
            $interval.cancel(interval);
            PathDataService.save(this.stats);
            this.changeStateWithDelay();
          }
        }, delay)

        return interval;
      }

      this.setPath = (index) => {
        this.tiles[index].isPath = true;
      }

      this.clearPath = () => {
        // clear path interval
        $interval.cancel(this.pathInterval);

        // clear path properties so css can update
        this.tiles.forEach(tile => tile.isPath = false);
      }

      this.mapWallsToBinaryGraph = (chunkedArr) => {
        return chunkedArr.map((chunk) => {
          return chunk.map((node) => {
            if (node.isWall) {
              return 0;
            } else {
              return 1;
            }
          })
        })
      }

      this.setGridNode = (arr) => {
        const graphNode = this.graph.grid[arr[0]][arr[1]];
        return graphNode;
      }

      this.getStartEndCoordinates = (tileArr) => {
        let coordinates = { start: [], end: [] }

        let startNode = tileArr.find((node) => node.isStart === true);
        let endNode = tileArr.find((node) => node.isEnd === true);

        coordinates.start = this.getNodeCoordinates(startNode);
        coordinates.end = this.getNodeCoordinates(endNode)

        return coordinates;
      }

      this.getNodeCoordinates = (node) => {
        nodeCoordinates = [];
        const xCoordinate = Math.floor(node.id / 12);
        const yCoordinate = node.id % 12;
        nodeCoordinates.push(xCoordinate, yCoordinate);
        return nodeCoordinates;
      }

      this.getIndexFromCoordinates = (coordinatesArr) => {
        // coordinatesArr comes in as [x, y];
        return (coordinatesArr[0] * 12) + (coordinatesArr[1]);
      }

      ////===================== resetColors ===========================

      this.resetColors = () => {
       for (prop in this.customColors) {
         this.customColors[prop] = this.defaultBackup[prop];
       }
      }

      ////===================== setting start/end/wall tiles ===========================
      // global button toggle
      this.isStartEnabled = false;
      this.isEndEnabled = false;

      this.toggleStartBtn = () => {
        if (this.isEndEnabled) {
          this.isEndEnabled = false;
          this.isStartEnabled = true;
        }
        else {
          // this.toggleProp(this.isStartEnabled);
          this.isStartEnabled = !this.isStartEnabled;
        }
      }

      this.toggleEndBtn = () => {
        if (this.isStartEnabled) {
          this.isStartEnabled = false;
          this.isEndEnabled = true;
        }
        else {
          // this.toggleProp(this.isStartEnabled);
          this.isEndEnabled = !this.isEndEnabled;
        }
      }

      this.onTileClick = (tile) => {
        if (this.isStartEnabled) {
          // select starting point
          this.setProps(tile, this.isStartEnabled, 'isStart');
        }
        else if (this.isEndEnabled) {
          // select ending point
          this.setProps(tile, this.isEndEnabled, 'isEnd');
        }
        else if (!tile.isStart && !tile.isEnd) {
          // build wall
          this.toggleWall(tile);
        }
      }

      this.toggleWall = (tile) => {
        if (!tile.isStart && !tile.isEnd) {
          tile.isWall = !tile.isWall;
        }
      }

      this.setTileClass = (tile) => {
        if (tile.isWall) {
          return 'wall';
        }
        else if (tile.isStart) {
          return 'start-pos';
        }
        else if (tile.isEnd) {
          return 'end-pos';
        }
        else if (tile.isPath && !tile.isStart && !tile.isEnd) {
          return 'path';
        }
      }

      this.setTileColor = (tile) => {
        if (tile.isWall) {
          return this.customColors.wall;
        }
        else if (tile.isStart) {
          return 'darkgreen';
        }
        else if (tile.isEnd) {
          return 'darkred';
        }
        else if (tile.isPath && !tile.isStart && !tile.isEnd) {
          return this.customColors.path;
        }
        else {
          return this.customColors.default;
        }
      }

      // for setting the starting and ending points
      this.setProps = (targetTile, condition, tileProp) => {
        // first disable all, then enable property for targetTile
        if (condition) {
          this.tiles.forEach((tile) => tile[tileProp] = false);
          targetTile[tileProp] = true;
        }
      }

    }]);
// end of controller 