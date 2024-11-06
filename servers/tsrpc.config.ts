import { CodeTemplate, TsrpcConfig } from 'tsrpc-cli';

const tsrpcConf: TsrpcConfig = {
    // Generate ServiceProto
    proto: [
        {
            //大厅服务器
            ptlDir: 'src/shared/hallClient/protocols', // Protocol dir
            output: 'src/shared/hallClient/protocols/serviceProto.ts', // Path for generated ServiceProto
            apiDir: 'src/hallServer/api',   // API dir
            docDir: 'docs/hallServer',     // API documents dir
            ptlTemplate: CodeTemplate.getExtendedPtl(),
            // msgTemplate: CodeTemplate.getExtendedMsg(),
        },
        {
            //游戏服务器
            ptlDir: 'src/shared/gameClient/protocols', // Protocol dir
            output: 'src/shared/gameClient/protocols/serviceProto.ts', // Path for generated ServiceProto
            apiDir: 'src/gameServer/api',   // API dir
            docDir: 'docs/gameServer',     // API documents dir
            ptlTemplate: CodeTemplate.getExtendedPtl(),
            // msgTemplate: CodeTemplate.getExtendedMsg(),
        },
        {
            //demo服务器
            ptlDir: 'src/shared/demoClient/protocols', // Protocol dir
            output: 'src/shared/demoClient/protocols/serviceProto.ts', // Path for generated ServiceProto
            apiDir: 'src/demoServer/api',   // API dir
            docDir: 'docs/demoServer',     // API documents dir
            ptlTemplate: CodeTemplate.getExtendedPtl(),
            // msgTemplate: CodeTemplate.getExtendedMsg(),
        },
        {
            //游戏集群服务器
            ptlDir: 'src/shared/tsgfServer/gameCluster/protocols', // Protocol dir
            output: 'src/shared/tsgfServer/gameCluster/protocols/serviceProto.ts', // Path for generated ServiceProto
            apiDir: 'src/gameServerCluster/api',   // API dir
            docDir: 'docs/gameServerCluster',     // API documents dir
            ptlTemplate: CodeTemplate.getExtendedPtl(),
        },
        {
            //匹配集群服务器
            ptlDir: 'src/shared/tsgfServer/matchCluster/protocols', // Protocol dir
            output: 'src/shared/tsgfServer/matchCluster/protocols/serviceProto.ts', // Path for generated ServiceProto
            apiDir: 'src/matchServerCluster/api',   // API dir
            docDir: 'docs/matchServerCluster',     // API documents dir
            ptlTemplate: CodeTemplate.getExtendedPtl(),
        },
    ],
    // Sync shared code
    sync: [
        {
            from: 'src/shared/tsgf',
            to: '../tsgf-sdk/src/tsgf',
            type: 'copy'     // Change this to 'copy' if your environment not support symlink
        },
        {
            from: 'src/shared/hallClient',
            to: '../tsgf-sdk/src/hallClient',
            type: 'copy'     // Change this to 'copy' if your environment not support symlink
        },
        {
            from: 'src/shared/gameClient',
            to: '../tsgf-sdk/src/gameClient',
            type: 'copy'     // Change this to 'copy' if your environment not support symlink
        },
        {
            from: 'src/shared/demoClient/protocols',
            to: '../tsgf-dev-demo-client/src/protocols',
            type: 'copy'     // Change this to 'copy' if your environment not support symlink
        },
    ],
    // Dev server
    dev: {
        autoProto: true,        // Auto regenerate proto
        autoSync: true,         // Auto sync when file changed
        autoApi: true,          // Auto create API when ServiceProto updated
        watch: 'src',           // Restart dev server when these files changed
        entry: 'src/index.ts',  // Dev server command: node -r ts-node/register {entry}
        //nodeArgs: ["--inspect-brk=33865"], // 可以打开远程调试,方便使用devTool调试检查内存性能等
    },
    // Build config
    build: {
        autoProto: true,        // Auto generate proto before build
        autoSync: true,         // Auto sync before build
        autoApi: true,          // Auto generate API before build
        outDir: 'dist',         // Clean this dir before build
    }
}
export default tsrpcConf;