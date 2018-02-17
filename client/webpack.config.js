const path = require('path'); //pega o caminho absolutpe
const babiliPlugin = require('babili-webpack-plugin');
//plugin para separar o javacript do css
const extractTextPlugin = require('extract-text-webpack-plugin'); 
//plugin para optimizar o css
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
//plugin para gerar paginas HTML
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**Como faremos para disponibilizar de uma maneira que seja acessível para todos os módulos da
 *  aplicação? Nosso objetivo é que ele fique em um escopo, que seja acessível por todos os módulos
 *  gerados no bundle.js. A solução será utilizar um plugin que já está embutido no Webpack: webpack.ProvidePlugin. 
 * Para isto, iremos importar o objeto que representa o webpack. */
const webpack = require('webpack'); //plugin para escopos globais. 

//lista de plugins
let plugins = [];

//Gereando o html dinaminco com as depedencias
plugins.push(new HtmlWebpackPlugin({
    hash: true, //vai colocar um hash no nome do css e javascript
    minify: {
        html5: true, //vai aceitar o padrao html5 (styles.css?050fd20e727d02198a49) a cada compilacao esse hash muda limpando do cacho do browser
        collapseWhitespace: true, //vai remover os espacos em bracno
        removeComments: true, //vai remover os comentarios
    },    
    filename: 'index.html', //nome do meu thml de saida
    template: __dirname + '/main.html' //templete que sera usado para criacao do index html
}));

plugins.push(
    new extractTextPlugin("styles.css")
);

/**Modulo escopo global - Colocando o Jquery no escopo global 
 * 
 * O que nós queremos disponibilizar para todos os módulos serem acessíveis, associamos ao 
 * $(cifão, alias do jQuery ); O jQuery também nos permitirá acessar o jQuery. 
 * O valor das duas variáveis disponibilizadas será o caminho do módulo 'jquery/dist/jquery.js', 
 * que será carregado pelo ProvidePlugin. As variáveis estarão no escopo acessível por cada módulo 
 * da aplicação, por isso, devemos utilizar um nome compreensível pelos plugins do jQuery
 *  (como $ e jQuery).
*/
plugins.push(
    new webpack.ProvidePlugin({
           $: 'jquery/dist/jquery.js',
           jQuery: 'jquery/dist/jquery.js'
    })
);


//Plugin para seperar bibliotecas de terceiro do meu bundle.
plugins.push(
    new webpack.optimize.CommonsChunkPlugin(
        { 
            name: 'vendor', 
            filename: 'vendor.bundle.js'
        }
    )
);

//Variaveis de escopo globais
let SERVICE_URL = JSON.stringify('http://localhost:3000');

//se for ambiente de producao 
if(process.env.NODE_ENV == 'production') {

    //API endereço producao
    SERVICE_URL = JSON.stringify('http://endereco-da-sua-api');

    plugins.push(new babiliPlugin());

    //Diminuind o numero de cloures no nosso modulo.
    /**
     * Vamos aplicar uma série de boas práticas. O Webpack, no passado, colocava cada módulo em uma 
     * closure e realizava um processo bem trabalhoso. Porém, é possível diminuir a quantidade de 
     * closures durante a criação dos módulos, isso acelera o tipo de processamento e carregamento 
     * no navegador.
     */
     // ATIVANDO O SCOPE HOISTING
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());   

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

//Seta variveis de escopo global
plugins.push(new webpack.DefinePlugin({ SERVICE_URL }));

module.exports = {
    entry: {
        app: './app-src/app.js',  //ponto de entrada da minha aplicacao
        vendor: ['jquery', 'bootstrap', 'reflect-metadata'] //vendor para biblioteca de terceriso
    },
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


 /**COMO WEBPACK ENCAPUSLO OS MODULOS
  * 
  * Cada módulo do nosso bundle é envolvido por um wrapper, que resumidamente se trata de uma função.
  *  Contudo, a existência desses wrappers tornam a execução do script um pouco mais lenta no 
  * navegador .

Entretanto, a partir do Webpack 3, podemos ativar o Scope Hoisting. Ele consiste em concatenar 
o escopo de todos os módulos em um único wrapper, permitindo assim que nosso código seja 
executado mais rapidamente no navegador.


    HTML5 compilnado a index
    npm install html-webpack-plugin@2.29.0 --save-dev

    para trabalhar sem System.Import somente como import quando estamos trabalho
    como modulos carregado sobre demanda precisamos um plugin. Webpack esta preparado
    para isso mas infelizmente o babel nao. Precisamos importar o pacote abaixo:
    npm install babel-plugin-syntax-dynamic-import@6.18.0 --save-dev


    Pastar "DIST"
    pasta dist (pasta de DESTRIBUICAO) contem os arquivos que vao para producao. Essa pasta voce  vai 
    mandar para IIS, APACHE, FTC etc.
  */