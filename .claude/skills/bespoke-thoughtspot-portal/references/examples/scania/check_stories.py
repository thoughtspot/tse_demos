import csv,collections
f=collections.defaultdict(lambda:[0.0]*6)
for r in csv.DictReader(open('out/SCANIA_VEHICLE_SHIFTS.csv')):
    q=r['SHIFT_DATE'][:7]
    if r['COUNTRY']=='Poland' and r['APPLICATION']=='Long Haulage':
        a=f[('PL-LH',q)]; a[0]+=float(r['IDLE_HOURS']); a[1]+=float(r['ENGINE_HOURS']); a[2]+=float(r['FUEL_L']); a[3]+=float(r['DISTANCE_KM'])
    elif r['APPLICATION']=='Long Haulage':
        a=f[('oth-LH',q)]; a[0]+=float(r['IDLE_HOURS']); a[1]+=float(r['ENGINE_HOURS']); a[2]+=float(r['FUEL_L']); a[3]+=float(r['DISTANCE_KM'])
    if r['REGION']=='Nordics':
        a=f[('NORD',q)]; a[4]+=float(r['CO2_KG']); a[3]+=float(r['DISTANCE_KM']); a[5]+=r['POWERTRAIN']=='Battery Electric'; a[1]+=1
for q in sorted({k[1] for k in f}):
    pl=f[('PL-LH',q)]; o=f[('oth-LH',q)]; n=f[('NORD',q)]
    print(q,'PL idle %.1f%% L/100 %.1f | other LH idle %.1f%% L/100 %.1f | Nordics CO2/km %.3f BEV share %.0f%%'%(100*pl[0]/pl[1],100*pl[2]/pl[3],100*o[0]/o[1],100*o[2]/o[3],n[4]/n[3],100*n[5]/n[1]))
