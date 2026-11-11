import csv,collections
z=collections.defaultdict(lambda:[0,0,0.0]); v=collections.defaultdict(lambda:[0,0,0.0,0.0]); act=0
for r in csv.DictReader(open('out/TANGOE_TELECOM_CHARGES.csv')):
    q=r['INVOICE_DATE'][:7]
    if r['SERVICE_CATEGORY'] in ('Mobile','SaaS','UCaaS'):
        k=(('FO' if r['BUSINESS_UNIT']=='Field Operations' else 'other'),q); z[k][0]+=1; z[k][1]+=int(r['ZERO_USAGE_LINES']); z[k][2]+=float(r['WASTED_SPEND'])
    if r['SERVICE_CATEGORY']=='Mobile':
        k=(('VOD' if r['VENDOR']=='Vodafone' else 'other'),q); v[k][0]+=1; v[k][1]+=int(r['BILLING_ERRORS']); v[k][2]+=float(r['DISPUTED_AMOUNT']); v[k][3]+=float(r['CREDITS_RECOVERED'])
    if r['ZERO_USAGE_LINES']=='1' and r['INVOICE_DATE']>='2026-10-06': act+=1
for q in sorted({k[1] for k in z}):
    a=z[('FO',q)]; b=z[('other',q)]; c=v[('VOD',q)]; e=v[('other',q)]
    print(q,'FO zero %.1f%% ($%dK) other %.1f%% | VOD err %.1f%% disp $%dK cred $%dK, other err %.1f%%'%(100*a[1]/a[0],a[2]/1e3,100*b[1]/b[0],100*c[1]/c[0],c[2]/1e3,c[3]/1e3,100*e[1]/e[0]))
print('zero-usage rows last 30d',act)
