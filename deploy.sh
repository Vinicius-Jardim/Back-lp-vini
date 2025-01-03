#!/bin/bash

# Criar pasta temporária
mkdir deploy_temp

# Copiar arquivos necessários
cp -r index.js config.js package.json package-lock.json src deploy_temp/

# Entrar na pasta
cd deploy_temp

# Instalar dependências
npm install --production

# Criar arquivo web.config
echo '<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^index.js\/debug[\/]?" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>' > web.config

# Criar zip
zip -r ../deploy.zip *

# Voltar para a pasta principal
cd ..

# Limpar
rm -rf deploy_temp
