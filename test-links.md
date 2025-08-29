# Test Links for Cat Terminal

Here are some test links to verify the clickable links functionality:

## Basic Links
- [OpenAI](https://openai.com)
- [GitHub](https://github.com)
- [xterm.js documentation](https://xtermjs.org/)

## Different Protocol Links  
- [Google Search](https://www.google.com/search?q=cat+terminal)
- [Electron Docs](https://www.electronjs.org/docs/latest/)

## Expected Behavior
When markdown mode is enabled, these links should:
1. Display as: "LinkText -> https://example.com"
2. The URL part should be underlined and blue
3. Clicking on the URL should open it in the default browser
4. A success message should appear in the terminal after opening

## Testing Steps
1. Run `/toggle markdown on` to enable markdown mode
2. Use `/cat test the links functionality with some sample links` 
3. Include some markdown links in your prompt
4. Verify links are clickable and open in browser