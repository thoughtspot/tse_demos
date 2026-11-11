import csv,collections
f=collections.defaultdict(lambda:[0.0]*8)
for r in csv.DictReader(open('out/SURESCRIPTS_NETWORK_TRANSACTIONS.csv')):
    q=r['TRANSACTION_DATE'][:7]
    if r['PA_REQUESTS']=='1' and r['PA_TURNAROUND_HOURS']:
        a=f[('TX' if r['STATE']=='Texas' else 'oth',q)]; a[0]+=float(r['PA_TURNAROUND_HOURS']); a[1]+=1; a[2]+=r['PA_CHANNEL']!='Fax / Phone'
    if r['NEW_RX']=='1':
        a=f[('NAV' if r['PBM']=='Navitus' else 'oPBM',q)]; a[3]+=1; a[4]+=int(r['RTPB_CHECKS']); a[5]+=int(r['ABANDONED_RX']); a[6]+=float(r['PATIENT_SAVINGS_USD'])
for q in sorted({k[1] for k in f}):
    t=f[('TX',q)]; o=f[('oth',q)]; n=f[('NAV',q)]; p=f[('oPBM',q)]
    print(q,'TX PA hrs %.1f (n%d ePA %.0f%%) other %.1f | NAV rtpb %.0f%% aband %.1f%% sav/1kRx %.0f (n%d) | others rtpb %.0f%% aband %.1f%% sav/1k %.0f'%(t[0]/t[1],t[1],100*t[2]/t[1],o[0]/o[1],100*n[4]/n[3],100*n[5]/n[3],1000*n[6]/n[3],n[3],100*p[4]/p[3],100*p[5]/p[3],1000*p[6]/p[3]))
