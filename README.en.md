# TSGF (Ts-GameFramework) positioning

* Guan **mgobe**
* **Open source** online game **Full stack solution**: `server` +`client` is written by **typescript** language
* "** Black Box **" implements online games: client docking SDK, do not care about communication and synchronous logic
* **Custom server logic**: Expand your synchronous logic and various interactive logic


# 详 详

## Login Process

![时序图](https://fengssy.gitee.io/zgame/Games/TSGF/SequenceDiagram.png)

## Server Ttructure

![拓扑图](https://fengssy.gitee.io/zgame/Games/TSGF/ServerStructure.png)

* `Gate` is an entry server (or scheduling server) + login server + cluster management server (simple three-in-one), there is a need to be separated

* `Backend` Game logic server, like a cost game, one server corresponds to a global game, all connected players are considered to join this game. You can also join the concept of the room

* `frontend` Game client (including 2 demo), imported to Creator 3.4.2 projects run Creator's Demo

* Configure connection information in the configuration file of `Gate` and` backend`

* Use [TSRPC](https://tsrpc.cn/) as a communication frame, so the code generated / synchronous module comes with this framework, resulting in a directory name of each item and a relative path (not familiar with the chaos Result in an error)

* PS: The root of each project requires each execution `npm i`, `frontend` Nery to open once with Creator *



## Server run, deploy (GATE, BACKEND)


### Development environment operation

* Notice! Dependence: **redis**, **mysql**
* Each side directory (GATE, BACKEND) executes `npm install` (can be performed once)
- `Gate` and` backend` Directory `gf.*.config.json`s (mainly configuring redis and mysql)
* cd `gate`, run `npm run dev`
* cd `backend`, run `npm run dev`

### One-button deployment (need to install **Docker Desktop**)

Run`/SimpleDeploy/run.bat`

### Manual deployment

* Notice! Dependence: **redis**, **mysql**
* Each side directory (GATE, BACKEND) executes `npm install` (can be performed once)
* Each directory (GATE, BACKEND) executes `NPM Run Buildts`, then package the following files:

      ./deploy
      ./dist
      ./node_modules
      . / GF.*.config.json (configuration is modified according to the actual situation)
* Windows deployment, providing shortcut deployment services, right-click administrator runs `deploy/install_runasadmin.cmd`
* Linux deployment, you can use `pm2` start:` pm2 start dist/index.js`

## Start frame synchronization DEMO (need to start the server first)

- Enter the `frontend` directory execution` npm install` (can be performed once)
- Viewing the simple multiplayer melee: (`frontend` Import Creator, start` assets / occupationthewar / occupationscene.scene`)
![对战效果](https://fengssy.gitee.io/zgame/Games/TSGF/PlayShow.gif)
* (Preview mode, you want to open the second client, you need to open the preview address with the `private` window, or switch to two browsers) *

- Browse Vue Implementation: Enter the `frontend` Directory Perform` NPM Run Devue` (If you don't start the browser, manually open the address of the output)
![示例图片](Demo1.gif)




## Secondary development, usage module

* Temporarily not providing multiplexed modes, only copying source code, two development or reference modules
* This feature is expected to offer V1.2.0

## Design requirements

- Status data separation, such as classic ECS design, convenient state synchronization, or frame synchronization is used as an intermediate state cache
- Input operation separation: convenient access frame synchronization

        In fact, as long as it is online game, you need to do the design above, just here to give the design principles proposed in this framework.

## frame synchronization game dock points (specific reference DEMO)

1. Configure the IP / Port of the REDIS server and each server.
2. Design independent data storage, such as ECS
3. Game server: According to the use scenario, instantiate the game object `Game`, then call the` startgame() `(Default Turn on Function: Frame Synchronization + Random Requirements Client Synchronization Status to the server)
4. Client: Main implementation:
    - `afterframes`: chasing the frame message, the client based on the status data + subsequent frames in the message
    - `SyncFrame`: server frame synchronization message, the default 60 frames per second (ie 60 messages per second)
    - `Inpframe`: The client's input frame message, it is recommended to collect, the timing is sent (such as 30ms send a batch), will take effect on the next frame received on the server
    - [`RequiResyncState`]: [Optional, default open] The server requires the client to collect the game data of this frame, use the` syncstate` message to the server
    - [`syncstate`]: [Optional, default open] The client will send the game data status, send it to the server, and can quickly restore the game from this status + subsequent frame when followed up.
5. Entrance server implements user login (reference example APILogintogame)