import fs from 'fs';
import path from 'path';

/**
 * Simple utility to check navigation links in the project
 * Run with: npx ts-node scripts/check-navigation.ts
 */

interface NavItem {
  title?: string;
  type?: string;
  href?: string;
  display?: string;
  newWindow?: boolean;
  [key: string]: any;
}

type NavConfig = {
  [key: string]: string | NavItem;
};

// Check if a file exists
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(`Error checking if file exists: ${filePath}`, err);
    return false;
  }
}

// Process a _meta.json file and check links
function processMetaFile(metaPath: string, basePath: string = '') {
  try {
    const content = fs.readFileSync(metaPath, 'utf8');
    const meta = JSON.parse(content) as NavConfig;
    
    // Track issues found
    const issues: string[] = [];
    
    // Process each entry
    Object.entries(meta).forEach(([key, value]) => {
      // Skip separators
      if (key === '---') return;
      
      // If it's just a string, it's a simple link to a page
      if (typeof value === 'string') {
        const targetPath = path.join(basePath, `${key}.mdx`);
        const targetTsxPath = path.join(basePath, `${key}.tsx`);
        const targetJsxPath = path.join(basePath, `${key}.jsx`);
        const targetJsPath = path.join(basePath, `${key}.js`);
        const targetIndexPath = path.join(basePath, key, 'index.mdx');
        const targetTsxIndexPath = path.join(basePath, key, 'index.tsx');
        
        const targetMetaPath = path.join(basePath, key, '_meta.json');
        
        if (fileExists(targetPath) || 
            fileExists(targetTsxPath) || 
            fileExists(targetJsxPath) || 
            fileExists(targetJsPath) || 
            fileExists(targetIndexPath) || 
            fileExists(targetTsxIndexPath)) {
          console.log(`✅ Link to ${key} is valid - file exists`);
        } else if (fileExists(targetMetaPath)) {
          console.log(`✅ Link to ${key} is valid - directory with _meta.json exists`);
          // Recursively check this directory
          processMetaFile(targetMetaPath, path.join(basePath, key));
        } else {
          issues.push(`❌ Link to ${key} is invalid - no matching file found`);
        }
      } 
      // If it's an object, check 'href' if present
      else if (typeof value === 'object' && value !== null) {
        const navItem = value as NavItem;
        
        if (navItem.href) {
          // External link or mail link
          if (navItem.href.startsWith('http') || navItem.href.startsWith('mailto:')) {
            console.log(`✅ External link to ${navItem.href} (type: external)`);
          } else {
            // Local link
            const targetPath = path.join(basePath, navItem.href);
            if (fileExists(targetPath)) {
              console.log(`✅ Link to ${navItem.href} is valid`);
            } else {
              issues.push(`❌ Link to ${navItem.href} is invalid - no matching file found`);
            }
          }
        } 
        // If no href, it points to a directory/file with the same name as the key
        else {
          const targetPath = path.join(basePath, `${key}.mdx`);
          const targetTsxPath = path.join(basePath, `${key}.tsx`);
          const targetJsxPath = path.join(basePath, `${key}.jsx`);
          const targetJsPath = path.join(basePath, `${key}.js`);
          const targetIndexPath = path.join(basePath, key, 'index.mdx');
          const targetTsxIndexPath = path.join(basePath, key, 'index.tsx');
          
          const targetMetaPath = path.join(basePath, key, '_meta.json');
          
          if (fileExists(targetPath) || 
              fileExists(targetTsxPath) || 
              fileExists(targetJsxPath) || 
              fileExists(targetJsPath) || 
              fileExists(targetIndexPath) || 
              fileExists(targetTsxIndexPath)) {
            console.log(`✅ Link to ${key} is valid - file exists`);
          } else if (fileExists(targetMetaPath)) {
            console.log(`✅ Link to ${key} is valid - directory with _meta.json exists`);
            // Recursively check this directory
            processMetaFile(targetMetaPath, path.join(basePath, key));
          } else {
            issues.push(`❌ Link to ${key} is invalid - no matching file found`);
          }
        }
      }
    });
    
    // Report any issues
    if (issues.length > 0) {
      console.log(`\nIssues found in ${metaPath}:`);
      issues.forEach(issue => console.log(issue));
    }
    
  } catch (err) {
    console.error(`Error processing meta file: ${metaPath}`, err);
  }
}

// Main function
function checkNavigation() {
  console.log('🔍 Checking navigation links...\n');
  
  const rootMetaPath = path.join(process.cwd(), 'pages', '_meta.json');
  if (fileExists(rootMetaPath)) {
    processMetaFile(rootMetaPath, path.join(process.cwd(), 'pages'));
  } else {
    console.error('❌ Root _meta.json not found at:', rootMetaPath);
  }
  
  console.log('\n✅ Navigation check complete');
}

// Run the check
checkNavigation(); 