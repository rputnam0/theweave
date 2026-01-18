# Docs - Config Step-by-Step - boxes
A New Design, Step By Step
--------------------------

Finally, we will take a brief look at the step-by-step process of creating a new design. A complex new design can be done in less than five minutes!

1.  **Create an empty box design.** The only entry so far between the `BOX` and `END` statements is an empty `SAMPLE` block.
    
2.  **Draw your box.** Do it inside the sample block. Just draw it like you think it should look.
    
3.  **Create the `SHAPES` block.** Create your shapes by pasting from the `SAMPLE` block. Remember that all lines in shape definitions must be of equal length.
    
4.  **Take care of quoting.** There are two ways to do that:
    
    *   If there are only a few double quotes or backslashes in your strings, tell your editor to double all backslashes in the `SHAPES` block for you. Do not double the backslashes before this point, or you will not be able to undo it so easily (see below). Then escape the double quotes (`"`) by telling your editor to put a backslash in front of every double quote which is part of a string.
    *   If you’ve got a lot of double quotes or backslashes in your strings, simply choose some other characters to be the special characters. This is achieved via the [`delimiter` statement](about:/config-syntax.html#delim).
    
    It might help to do this in the Vim editor using our [boxes syntax](https://raw.githubusercontent.com/ascii-boxes/boxes/master/boxes.vim). It understands `delim` statements and can help correct the escaping by highlighting were stuff is still broken. But use any editor you like, of course.
    
5.  **Add the other entries.** You must at least add the `ELASTIC` entry, but this is also the time to add any other entries you might need.
    
6.  **Do not leave your editor just yet.** Instead try out your design. This is because if you made a mistake with the line lengths or something, you can still easily undo the doubling of backslashes. Otherwise, it may become difficult to judge how long a line is.
    
7.  **Refine your design.** Repeat appropriate steps until done.
    

It is precision work to finalize the box design. But this needs to be done only once, and the box design can be shared and reused easily.

Read on in the next part: [Configuration File Best Practices](https://boxes.thomasjensen.com/config-best-practices.html)

Page created: April 6, 1999 Last updated: December 23, 2014