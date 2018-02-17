const path = require('path'); //pega o caminho absolutpe
const babiliPlugin = require('babili-webpack-plugin');
//plugin para separar o javacript do css
const extractTextPlugin = require('extract-text-webpack-plugin'); 
//plugin para optimizar o css
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');


//lista de plugins
let plugins = [];

plugins.push(
    new extractTextPlugin("styles.css")
);

//se for ambiente de producao 
if(process.env.NODE_ENV == 'production') {
    plugins.push(new babiliPlugin());

    plugins.push(new optimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { 
            discardComments: {
                removeAll: true 
            }
        },
        canPrint: true
     }));   
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
            // { 
            //     test: /\.css$/, 
            //     loader: 'style-loader!css-loader' //executa da direita para esquerda exe -> 1) css-loader 2)tyle-loader 
            // } ,
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                }) //ira separar o css do javascript
            },
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
 * css estractor
 * npm install extract-text-webpack-plugin@3.0.0 --save-dev
 * 
 * 
 *  optimize-css-assets-webpack-plugin: Ele receberá a responsabilidade por processar o style.css.
 *  gerado antes de ser gravado na pasta de build. Porém, ele nao sabe processar o CSS, ainda será 
 * preciso ter um minificador CSS, no caso, usaremos o cssnano. 
 * . Podemos combinar os dois plugin com Webpack, juntamente com cssnano, que pode ser usado em qualquer 
 * sistema. Faremos a instalação pelo Terminal:
 * npm install optimize-css-assets-webpack-plugin@2.0.0 --save-dev
   npm install cssnano@3.10.0 --save-dev
 * 
 * npm run build
 */