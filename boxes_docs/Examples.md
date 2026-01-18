Title: Examples

URL Source: https://boxes.thomasjensen.com/examples.html

Markdown Content:
Remember, _boxes_ is designed to be tied to your editor as a [text filter](https://boxes.thomasjensen.com/docs/filters.html). So these examples assume you need only push a single key (or at least very few) in order to call _boxes_. Don’t be worried by seemingly long argument lists - you’ll only have to type them once.

Unless stated otherwise, the input used for these examples is the following:

```
Different all twisty a
of in maze are you,
passages little.
```

Default action[](https://boxes.thomasjensen.com/examples.html#default-action)
-----------------------------------------------------------------------------

`boxes`

```
/**************************/
/* Different all twisty a */
/* of in maze are you,    */
/* passages little.       */
/**************************/
```

Draws a standard box of the first valid design found in your config file. If you have the config file as it comes with the _boxes_ distribution, you get a "C" box, as you can see above.

Combining with other tools[](https://boxes.thomasjensen.com/examples.html#with-tools)
-------------------------------------------------------------------------------------

As a text filter, _boxes_ can be combined easily with other tools, for example _figlet_ and _lolcat_:

`figlet "boxes . . . !" | lolcat -f | boxes -d unicornthink`

Note: _lolcat_ is supported since _boxes_ v2.0.0.

Choosing a different design[](https://boxes.thomasjensen.com/examples.html#design)
----------------------------------------------------------------------------------

`boxes -d parchment`

```
________________________
/\                       \
\_|Different all twisty a|
  |of in maze are you,   |
  |passages little.      |
  |   ___________________|_
   \_/_____________________/
```

The **-d**_design\_name_ option selects another design from your config file.

Positioning of text inside box[](https://boxes.thomasjensen.com/examples.html#position)
---------------------------------------------------------------------------------------

`boxes -d diamonds -a hcvc`

```
/\          /\          /\
    /\//\\/\    /\//\\/\    /\//\\/\
 /\//\\\///\\/\//\\\///\\/\//\\\///\\/\
//\\\//\/\\///\\\//\/\\///\\\//\/\\///\\
\\//\/                            \/\\//
 \/                                  \/
 /\      Different all twisty a      /\
//\\     of in maze are you,        //\\
\\//     passages little.           \\//
 \/                                  \/
 /\                                  /\
//\\/\                            /\//\\
\\///\\/\//\\\///\\/\//\\\///\\/\//\\\//
 \/\\///\\\//\/\\///\\\//\/\\///\\\//\/
    \/\\//\/    \/\\//\/    \/\\//\/
       \/          \/          \/
```

The **-a**_format_ option can be used to position the input text inside a box which is larger than needed for our text. `hcvc` stands for "**h**orizontally **c**entered, **v**ertically **c**entered".

Note that the box was drawn in this size because the shapes that compose it are very big, so that it is not possible to fit the box tighter around our text. Note also that the input lines themselves are _not_ centered; `hc` only centers the input text block as a whole.

Line justification[](https://boxes.thomasjensen.com/examples.html#line-justification)
-------------------------------------------------------------------------------------

`boxes -d simple -a jr`

```
************************
*Different all twisty a*
*   of in maze are you,*
*      passages little.*
************************
```

This uses the third possible argument to the **-a** option, `j`. `jr` stands for "**j**ustification **r**ight".

Quick alignment/positioning[](https://boxes.thomasjensen.com/examples.html#quick-alignment-positioning)
-------------------------------------------------------------------------------------------------------

`boxes -d dog -a c`

```
__   _,--="=--,_   __
         /  \."    .-.    "./  \
        /  ,/  _   : :   _  \/` \
        \  `| /o\  :_:  /o\ |\__/
         `-'| :="~` _ `~"=: |
            \`     (_)     `/
     .-"-.   \      |      /   .-"-.
.---{     }--|  /,.-'-.,\  |--{     }---.
 )  (_)_)_)  \_/`~-===-~`\_/  (_(_(_)  (
(        Different all twisty a         )
 )         of in maze are you,         (
(           passages little.            )
 )                                     (
'---------------------------------------'
```

Since noone really wants to type `-a hcvcjc` only to actually center text inside a box, there are shorthand notations (`l`, `c`, and `r`).

Note the blank line at the bottom of the box (after `little`, but before the dashes) which is necessary to make the bottom of the box look right. If the blank line was not there, the box would end on a closing parenthesis, thus looking broken.

Box size specification[](https://boxes.thomasjensen.com/examples.html#size)
---------------------------------------------------------------------------

`boxes -d html -s 40`

```
<!-- - - - - - - - - - - - - - - - - -->
<!-- Different all twisty a          -->
<!-- of in maze are you,             -->
<!-- passages little.                -->
<!-- - - - - - - - - - - - - - - - - -->
```

Using `-s 40`, we have set the box width to 40 characters.

Box size specification (2)[](https://boxes.thomasjensen.com/examples.html#size2)
--------------------------------------------------------------------------------

`boxes -d peek -a c -s 40x11`

```
/*       _\|/_
         (o o)
 +----oOO-{_}-OOo----------------------+
 |                                     |
 |                                     |
 |       Different all twisty a        |
 |         of in maze are you,         |
 |          passages little.           |
 |                                     |
 |                                     |
 +------------------------------------*/
```

Using `-s 40x11`, you can set both width and height. Setting just the height is possible with `-s x11` (note the leading `x` on the argument).

Text Padding[](https://boxes.thomasjensen.com/examples.html#padding)
--------------------------------------------------------------------

`boxes -d shell -p a1l2`

```
###########################
#                         #
#  Different all twisty a #
#  of in maze are you,    #
#  passages little.       #
#                         #
###########################
```

Normally, the padding values depend on the design. The "shell" design has no default padding, so we can see the effects of our command line option unchanged. `a1l2` stands for "**a**ll **1**, **l**eft **2**", and tells _boxes_ to put one space (or empty line, in the vertical direction) around the input text block, except for the left side where two spaces shall be used.

Text Padding (2)[](https://boxes.thomasjensen.com/examples.html#padding2)
-------------------------------------------------------------------------

`boxes -p h0v0`

```
/************************/
/*Different all twisty a*/
/*of in maze are you,   */
/*passages little.      */
/************************/
```

This uses again the default design, which by default features a horizontal padding value of one space (as you know from the very first example). By specifying `-p h0v0`, we set all padding to zero ("**h**orizontal **0**, **v**ertical **0**"). In this case, the same could have been achieved by `-p h0` or `-p a0`.

Imagine you want to comment out the following C code:

```
if (!s2 || *s2 == '\0')
    return (char *) s1;  /* error 1 */
if (!s1 || *s1 == '\0')
    return NULL;         /* error 2 */
if (skip < 0)
    skip = 0;            /* foo bar */
```

`boxes -d c-cmt`

```
/* if (!s2 || *s2 == '\0')                 */
/*     return (char *) s1;  /* error 1 *\/ */
/* if (!s1 || *s1 == '\0')                 */
/*     return NULL;         /* error 2 *\/ */
/* if (skip < 0)                           */
/*     skip = 0;            /* foo bar *\/ */
```

Note that the closing comment tags in the input text have been escaped by adding a backslash between the asterisk and the slash. This way, the comments that have been commented out along with the rest of the code will not interfere with the new comments.

`boxes -r`

```
if (!s2 || *s2 == '\0')
    return (char *) s1;  /* error 1 */
if (!s1 || *s1 == '\0')
    return NULL;         /* error 2 */
if (skip < 0)
    skip = 0;            /* foo bar */
```

Should you decide to reactivate the code previouly commented out, the escaped closing comment tags are changed back into normal ones. This is achieved by the `replace` and `reverse` statements in the config file entry describing this particular box design. If you want this to work recursively, simply add more such statements.

Box removal[](https://boxes.thomasjensen.com/examples.html#removal)
-------------------------------------------------------------------

Imagine your once beautiful box in "C" style like this in your editor, after you are done editing the text inside:

```
/********************************************************************/

/*  Generate sorted listing of available box styles.
    Uses design name from BOX spec and sample picture plus author.
                                            */
/*  RETURNS:  != 0   on error (out of memory)    */
              == 0   on success                              */
/********************************************************************/
```

`boxes -r`

```
Generate sorted listing of available box styles.
 Uses design name from BOX spec and sample picture plus author.

 RETURNS:  != 0   on error (out of memory)
           == 0   on success
```

The box is correctly removed even though it’s been badly damaged by editing of the text inside. Obviously, the box design was correctly autodected as being "C". Note there is only a single leading space in the output text, whereas there are two leading spaces in the input text. This is because the "C" box design has a default horizontal padding of one space. Since _boxes_ assumes it has added the padding space, it also attempts to removes the same number of spaces when removing the box. Thus, if you were to add a new box around the text, the box internal indentation would be retained. It is easily possible to use this feature to make an editor key mapping which repairs a box for you (see [installation](https://boxes.thomasjensen.com/editors.html) in the documentation section).

Box removal (2)[](https://boxes.thomasjensen.com/examples.html#removal2)
------------------------------------------------------------------------

Imagine an HTML comment box like the follwing, and imagine that _boxes_ does not correctly autodetect it as being an HTML box:

```
<!-- - - - - - - - - - - - - -->
<!-- Different all twisty a  -->
<!-- of in maze are you,     -->
<!-- passages little.        -->
<!-- - - - - - - - - - - - - -->
```

`boxes -r -d html`

```
Different all twisty a
of in maze are you,
passages little.
```

In cases where design autodetection fails, **-d**_design\_name_ can be added to the **-r** command in order to tell _boxes_ which design exactly to remove. It is always a good thing to use the **-d** option, because it makes autodetection unnecessary. Autodetection takes more time, because the entire config file must be parsed instead of just the one design needed, and all designs must be matched against the input text in order to see which one fits best.

Indentation handling[](https://boxes.thomasjensen.com/examples.html#indent)
---------------------------------------------------------------------------

For this example, our input text is indented by four spaces:

```
Different all twisty a
    of in maze are you,
    passages little.
```

`boxes -d java-cmt -i box`

```
// Different all twisty a
    // of in maze are you,
    // passages little.
```

The default indent mode is `box`, which indents the box by the same value as the input text was indented. As shown here, this is useful when adding regional comments to your source code, e.g. when "commenting out" a large portion of your code. Most people generally prefer to indent comments by the same value as the code they refer to, so they don’t upset the code structure.

`boxes -d vim-cmt -i text`

```
"     Different all twisty a
"     of in maze are you,
"     passages little.
```

By specifying `-i text`, the box is made to start at column zero and any input text indentation is retained inside the box.

`boxes -d pound-cmt -i none`

```
# Different all twisty a
# of in maze are you,
# passages little.
```

Finally, it is also possible to throw away any indentation altogether by specifying `-i none`.

Use of Regular Expressions[](https://boxes.thomasjensen.com/examples.html#regexp)
---------------------------------------------------------------------------------

```
Global Variables
```

`boxes -d headline`

```
/*************************************/
/*  G l o b a l   V a r i a b l e s  */
/*************************************/
```

The `replace` and `reverse` statements may contain regular expressions and backreferences, which can be used for more elaborate text modifications. The example shown here, where spaces are inserted between the individual characters, is configured [like this](https://github.com/ascii-boxes/boxes/blob/ac8617b3839d372e108b6eea3a5e7743232281da/boxes-config#L1734-L1739).

`boxes -d headline -r`

```
Global Variables
```

Page created: April 6, 1999 Last updated: February 17, 2021