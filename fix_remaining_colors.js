const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src/components');
files.push('frontend/src/App.jsx');
files.push('frontend/src/index.css');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Add light variants to bg-black and very dark slate colors if missing
  content = content.replace(/bg-black(?!\/?[\w-]|\s+light:bg)/g, 'bg-black light:bg-white');
  content = content.replace(/bg-slate-950(?!\/?[\w-]|\s+light:bg)/g, 'bg-slate-950 light:bg-slate-50');
  
  // Any stray #0A0F24 or #050816 that got missed by previous regex
  content = content.replace(/bg-\[#0A0F24\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#0A0F24] light:bg-white');
  content = content.replace(/bg-\[#050816\](?!\/?[\w-]|\s+light:bg)/g, 'bg-[#050816] light:bg-slate-50');
  
  // Also check for 'dark:' classes which are incorrect in our setup
  // We use .light and light: custom variant, so dark: is default and light: is the toggle.
  // If we see dark:bg-black we should probably just make it bg-black.
  content = content.replace(/dark:bg-black/g, 'bg-black');
  content = content.replace(/dark:bg-slate-900/g, 'bg-slate-900');
  content = content.replace(/dark:bg-\[#0A0F24\]/g, 'bg-[#0A0F24]');
  
  // Look for any remaining text-gray-400 or text-slate-400 without light variant
  content = content.replace(/text-gray-400(?!\/?[\w-]|\s+light:text)/g, 'text-gray-400 light:text-slate-500');
  content = content.replace(/text-slate-400(?!\/?[\w-]|\s+light:text)/g, 'text-slate-400 light:text-slate-500');
  
  // Any new gradient from-black or to-black
  content = content.replace(/from-black(?!\/?[\w-]|\s+light:from)/g, 'from-black light:from-white');
  content = content.replace(/to-black(?!\/?[\w-]|\s+light:to)/g, 'to-black light:to-white');
  
  // Make sure bg-gray-900 or bg-gray-800 turns light
  content = content.replace(/bg-gray-900(?!\/?[\w-]|\s+light:bg)/g, 'bg-gray-900 light:bg-slate-100');
  content = content.replace(/bg-gray-800(?!\/?[\w-]|\s+light:bg)/g, 'bg-gray-800 light:bg-slate-200');

  // Check border-white/10
  content = content.replace(/border-white\/10(?!\/?[\w-]|\s+light:border)/g, 'border-white/10 light:border-slate-200');
  content = content.replace(/border-white\/5(?!\/?[\w-]|\s+light:border)/g, 'border-white/5 light:border-slate-200');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Polished colors in:', f);
  }
});
