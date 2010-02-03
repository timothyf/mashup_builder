var INSERT_MASHUP = "Insert_Mashup"

// Register the related commands.
FCKCommands.RegisterCommand(INSERT_MASHUP, new FCKDialogCommand('Select Mashup','Select Mashup', FCKConfig.PluginsPath + 'mashup/insertMashup.html' , 640, 370 ) ) ;

// Create the "Find" toolbar button.
var insertMashupItem = new FCKToolbarButton(INSERT_MASHUP,'Insert Mashup') ;
//insertMashupItem.IconPath = FCKConfig.PluginsPath + 'findreplace/find.gif' ;
insertMashupItem.IconPath = "file:///home/david/NetBeansProjects/Afrous/web/fckeditor/editor/images/smiley/msn/sad_smile.gif";

FCKToolbarItems.RegisterItem(INSERT_MASHUP, insertMashupItem);