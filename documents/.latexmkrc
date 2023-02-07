# 設定よくわからんけどとりあえず動けばよし！ｗ
$latex                       = 'platex -synctex=1 -halt-on-error -interaction=nonstopmode -file-line-error';
$latex_silent                = 'platex -synctex=1 -halt-on-error -interaction=nonstopmode -file-line-error';
$bibtex                      = 'pbibtex';
$dvipdf                      = 'dvipdfmx %O -o %D %S';
$max_repeat                  = 6;
$pdf_mode                    = 3;
$pvc_view_file_via_temporary = 0;

#$latex                       = 'uplatex -synctex=1 -halt-on-error -interaction=nonstopmode -file-line-error';
#$latex_silent                = 'uplatex -synctex=1 -halt-on-error -interaction=nonstopmode -file-line-error';
#$bibtex                      = 'upbibtex';

#$latex = 'platex';
#$bibtex = 'pbibtex';
#$dvipdf = 'dvipdfmx %O -o %D %S';
#$makeindex = 'mendex -U %O -o %D %S';
#$pdf_mode = 3;