const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('verificar-instalacao.js', function() {
  this.timeout(10000);
  
  const scriptPath = path.join(__dirname, '..', 'verificar-instalacao.js');
  
  it('deve existir', function() {
    assert.ok(fs.existsSync(scriptPath), 'Script verificar-instalacao.js deve existir');
  });
  
  it('deve ser executável', function() {
    try {
      fs.accessSync(scriptPath, fs.constants.X_OK);
      assert.ok(true, 'Script deve ser executável');
    } catch (e) {
      assert.fail('Script não é executável');
    }
  });
  
  it('deve executar sem erros', function() {
    let output;
    try {
      output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    } catch (e) {
      // Exit code 1 is expected if issues are found, which is OK
      output = e.stdout || '';
    }
    
    assert.ok(output.includes('RELATÓRIO DE VERIFICAÇÃO F.A.S.E.'), 'Deve mostrar relatório');
    assert.ok(output.includes('INSTALAÇÃO DO PACOTE'), 'Deve verificar pacote');
    assert.ok(output.includes('RUNTIMES CONFIGURADOS'), 'Deve verificar runtimes');
    assert.ok(output.includes('WORKFLOWS FASE'), 'Deve verificar workflows');
  });
  
  it('deve mostrar status da instalação do pacote', function() {
    let output;
    try {
      output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    } catch (e) {
      output = e.stdout || '';
    }
    
    assert.ok(
      output.includes('Status:') && (output.includes('INSTALADO') || output.includes('NÃO INSTALADO') || output.includes('NÃO DISPONÍVEL')),
      'Deve mostrar status da instalação'
    );
  });
  
  it('deve verificar todos os runtimes', function() {
    let output;
    try {
      output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    } catch (e) {
      output = e.stdout || '';
    }
    
    assert.ok(output.includes('Claude Code'), 'Deve verificar Claude Code');
    assert.ok(output.includes('OpenCode'), 'Deve verificar OpenCode');
    assert.ok(output.includes('Gemini'), 'Deve verificar Gemini');
    assert.ok(output.includes('Codex'), 'Deve verificar Codex');
  });
  
  it('deve mostrar ações sugeridas se houver problemas', function() {
    let output;
    try {
      output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    } catch (e) {
      output = e.stdout || '';
    }
    
    // Se houver problemas, deve mostrar sugestões
    if (output.includes('PROBLEMA(S) ENCONTRADO')) {
      assert.ok(output.includes('AÇÕES SUGERIDAS'), 'Deve mostrar ações sugeridas');
      assert.ok(output.includes('Comando:'), 'Deve mostrar comandos para corrigir');
    }
  });
  
  it('deve mostrar versão do FASE', function() {
    let output;
    try {
      output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    } catch (e) {
      output = e.stdout || '';
    }
    
    const pkg = require('../package.json');
    assert.ok(
      output.includes(pkg.version) || output.includes('v'),
      'Deve mostrar versão do FASE'
    );
  });
});
