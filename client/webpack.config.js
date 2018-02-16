const path = require('path'); //pega o caminho absolutpe
const babiliPlugin = require('babili-webpack-plugin');

//lista de plugins
let plugins = [];

//se for ambiente de producao 
if(process.env.NODE_ENV == 'production') {
    plugins.push(new babiliPlugin());
}

module.exports = {
    entry:'./app-src/app.js', //ponto de entrada da minha aplicacao
    output:{
        filename:'bundle.js',
        path: path.resolve(__dirname,'dist'), //__dirname caminho do meu arquivo.
        publicPath: 'dist' //criar o bundle em tempo de execucao em momoria.
    },
    module:{ //aqui vou por as regras que vao ser aplicadas para transpliar
        rules:[
            {
                test: /\.js$/,
                exclude:/node_modules/ ,
                use:{
                        loader:'babel-loader'
                    }
            } ,
            { 
                test: /\.css$/, 
                loader: 'style-loader!css-loader' //executa da direita para esquerda exe -> 1) css-loader 2)tyle-loader 
            } ,
            {  ///Loader font
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/font-woff' 
            },
            { 
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            { 
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'file-loader' 
            },
            { 
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml' 
            }          
            
        ]

    },
    plugins
}

/**
 * LOADER X PLUGIN
 * LOADER: olha arquivo por arquivo, e vai transpilando
 * PLUSING: trabalhar depois do build, pega o arquivo transpilado e unglifica.npm install cross-env@5.0.1 --save-dev
 * 
 * npm install webpack-dev-server@2.5.1 --save-dev
 * webpack dev server atraves da api o bundle em momeria
 * ele nao vai existir fisicamente.
 * 
 * npm install css-loader@0.28.4 style-loader@0.18.2 --save-dev
 * css-loader@0.28.4 : transforma o css in json
 * style-loader@0.18.2: imprimi o css no head do documento html (css inline)
 * 
 * 
 * Loader font
 * npm install url-loader@0.5.9 file-loader@0.11.2 --save-dev
 * 
 * npm run build
 */